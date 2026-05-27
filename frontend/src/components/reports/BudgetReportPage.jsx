import { useMemo, useState } from 'react';
import { CalendarDays, Download, FileSpreadsheet } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeDate(value) {
  if (!value) {
    return '';
  }

  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
}

function displayDate(value) {
  const normalized = normalizeDate(value);

  if (!normalized) {
    return '';
  }

  const [year, month, day] = normalized.split('-');
  return `${day}/${month}/${year}`;
}

function currency(value) {
  return Number(value || 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  });
}

function escapeSpreadsheetCell(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function buildBudgetRows(domains) {
  const totalsByProvider = domains.reduce((map, domain) => {
    const provider = domain.provider_name || 'Sin proveedor';
    const total = Number(domain.total_amount || 0);

    map.set(provider, (map.get(provider) || 0) + total);
    return map;
  }, new Map());

  return Array.from(totalsByProvider.entries())
    .map(([provider, total]) => ({
      provider,
      input: `Renovación Dominios ${provider}`,
      total,
    }))
    .sort((left, right) => left.provider.localeCompare(right.provider, 'es'));
}

function buildWorkbook(rows, startDate, endDate) {
  const period = `${displayDate(startDate)} - ${displayDate(endDate)}`;
  const body = rows.map((row) => `
    <tr>
      <td>${escapeSpreadsheetCell(row.input)}</td>
      <td></td>
      <td>${escapeSpreadsheetCell(displayDate(startDate))}</td>
      <td>${escapeSpreadsheetCell(currency(row.total))}</td>
      <td></td>
    </tr>
  `).join('');

  return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; }
          td, th { border: 1px solid #d9d9d9; padding: 3px 6px; }
          .period { background: #000; color: #fff; font-weight: 700; text-align: center; }
          .header th { background: #a6a6a6; color: #000; font-weight: 700; text-align: center; }
          .input { min-width: 250px; font-weight: 700; }
          .date { text-align: center; }
          .amount { min-width: 110px; text-align: right; }
        </style>
      </head>
      <body>
        <table>
          <tr><td class="period" colspan="5">${escapeSpreadsheetCell(period)}</td></tr>
          <tr class="header">
            <th>Insumo</th>
            <th>Factura A</th>
            <th>Fecha de Pago</th>
            <th>Monto (MXN)</th>
            <th>TDC</th>
          </tr>
          ${body}
        </table>
      </body>
    </html>
  `;
}

export function BudgetReportPage() {
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const isDateRangeValid = useMemo(() => (
    Boolean(startDate && endDate && startDate <= endDate)
  ), [startDate, endDate]);

  async function handleGenerate(event) {
    event.preventDefault();
    setError('');

    if (!isDateRangeValid) {
      setError('Selecciona un rango de fechas válido.');
      return;
    }

    setIsGenerating(true);

    try {
      const result = await apiClient.listAllDomains({
        expiration_from: startDate,
        expiration_to: endDate,
      });
      const rows = buildBudgetRows(result.data || []);

      if (!rows.length) {
        setError('No se encontraron dominios con vencimiento en el rango seleccionado.');
        return;
      }

      downloadFile(
        buildWorkbook(rows, startDate, endDate),
        `presupuesto-dominios-${startDate}-${endDate}.xls`,
        'application/vnd.ms-excel;charset=utf-8',
      );
    } catch (generateError) {
      setError(generateError.message);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="content-area">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Reportes</p>
          <h1>Presupuesto</h1>
          <span>Exporta renovaciones de dominios agrupadas por proveedor.</span>
        </div>
      </section>

      {error && <div className="alert-error">{error}</div>}

      <section className="panel report-panel">
        <form className="report-form" onSubmit={handleGenerate}>
          <label className="form-field" htmlFor="budget-start-date">
            <span>Fecha inicial</span>
            <div className="date-field-control">
              <input
                id="budget-start-date"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
              <CalendarDays size={17} aria-hidden="true" />
            </div>
          </label>

          <label className="form-field" htmlFor="budget-end-date">
            <span>Fecha Final</span>
            <div className="date-field-control">
              <input
                id="budget-end-date"
                name="endDate"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                required
              />
              <CalendarDays size={17} aria-hidden="true" />
            </div>
          </label>

          <button className="primary-button" type="submit" disabled={isGenerating}>
            {isGenerating ? <Download size={17} /> : <FileSpreadsheet size={17} />}
            {isGenerating ? 'Generando' : 'Generar'}
          </button>
        </form>
      </section>
    </main>
  );
}
