import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { referenceDefinitions } from '../../config/resources';
import { apiClient } from '../../services/apiClient';

const LIST_PAGE_SIZE = 100;

function getInitialValue(field) {
  if (typeof field.defaultValue === 'function') {
    return field.defaultValue();
  }

  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }

  if (field.type === 'checkbox') {
    return false;
  }

  return '';
}

function buildInitialForm(resource) {
  return resource.fields.reduce((form, field) => ({
    ...form,
    [field.name]: normalizeFieldValue(field, getInitialValue(field)),
  }), {});
}

function buildInitialFilters(resource) {
  return (resource.filters || []).reduce((filters, field) => ({
    ...filters,
    [field.name]: '',
  }), {});
}

function getOptionLabel(field, option, references) {
  if (field.optionLabel) {
    return field.optionLabel(option, references);
  }

  return option[field.labelProperty || 'name'] || option.name || option.extension || `#${option.id}`;
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  if (typeof value === 'string') {
    return normalizeDateValue(value) || '-';
  }

  return normalizeDateValue(value) || '-';
}

function normalizeDateValue(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);

    if (match) {
      return match[1];
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

function normalizeFieldValue(field, value) {
  if (field.type === 'date') {
    return normalizeDateValue(value);
  }

  return value;
}

function formatCell(row, column, references) {
  const value = row[column.key];

  if (column.type === 'boolean') {
    return value ? 'Sí' : 'No';
  }

  if (column.type === 'date' || column.type === 'datetime') {
    return formatDate(value);
  }

  if (column.reference) {
    const options = references[column.reference] || [];
    const option = options.find((item) => Number(item.id) === Number(value));
    return option?.[column.labelProperty || 'name'] || option?.extension || value || '-';
  }

  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return value;
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

function normalizePayload(resource, form, editingRecord) {
  return resource.fields.reduce((payload, field) => {
    const value = form[field.name];

    if (field.optionalOnEdit && editingRecord && !value) {
      return payload;
    }

    if ((field.nullable || field.type === 'select') && value === '') {
      payload[field.name] = null;
      return payload;
    }

    if (field.type === 'checkbox') {
      payload[field.name] = Boolean(value);
      return payload;
    }

    if (field.type === 'date') {
      payload[field.name] = normalizeDateValue(value);
      return payload;
    }

    payload[field.name] = value;
    return payload;
  }, {});
}

function FieldInput({
  field,
  value,
  onChange,
  references,
  editingRecord,
}) {
  const commonProps = {
    id: field.name,
    name: field.name,
    value: value ?? '',
    onChange: (event) => onChange(field.name, event.target.value),
    required: field.required && !(field.optionalOnEdit && editingRecord),
  };

  if (field.type === 'textarea') {
    return <textarea {...commonProps} rows="3" />;
  }

  if (field.type === 'select') {
    const sourceOptions = field.staticOptions || references[field.reference] || [];
    const options = field.filter ? sourceOptions.filter(field.filter) : sourceOptions;

    return (
      <select {...commonProps}>
        <option value="">Seleccione</option>
        {options.map((option) => (
          <option key={option.id || option.value} value={option.id || option.value}>
            {option.label || getOptionLabel(field, option, references)}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <input
        id={field.name}
        name={field.name}
        type="checkbox"
        checked={Boolean(value)}
        onChange={(event) => onChange(field.name, event.target.checked)}
      />
    );
  }

  if (field.type === 'date') {
    return (
      <div className="date-field-control">
        <input
          {...commonProps}
          type="date"
          value={normalizeDateValue(value)}
        />
        <CalendarDays size={17} aria-hidden="true" />
      </div>
    );
  }

  return (
    <input
      {...commonProps}
      type={field.type}
      step={field.type === 'number' ? '0.0001' : undefined}
    />
  );
}

function FilterInput({
  field,
  value,
  onChange,
  references,
}) {
  const commonProps = {
    id: `filter-${field.name}`,
    name: field.name,
    value: value ?? '',
    onChange: (event) => onChange(field.name, event.target.value),
  };

  if (field.type === 'select') {
    const sourceOptions = field.staticOptions || references[field.reference] || [];
    const options = field.filter ? sourceOptions.filter(field.filter) : sourceOptions;

    return (
      <select {...commonProps}>
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option.id || option.value} value={option.id || option.value}>
            {option.label || getOptionLabel(field, option, references)}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'date') {
    return (
      <div className="date-field-control">
        <input
          {...commonProps}
          type="date"
          value={normalizeDateValue(value)}
          placeholder="AAAA-MM-DD"
        />
        <CalendarDays size={17} aria-hidden="true" />
      </div>
    );
  }

  return (
    <input
      {...commonProps}
      type={field.type === 'search' ? 'search' : field.type}
      placeholder={field.placeholder || field.label}
    />
  );
}

export function CrudPage({ resource }) {
  const [records, setRecords] = useState([]);
  const [references, setReferences] = useState({});
  const [meta, setMeta] = useState({ total: 0 });
  const [form, setForm] = useState(() => buildInitialForm(resource));
  const [filters, setFilters] = useState(() => buildInitialFilters(resource));
  const [appliedFilters, setAppliedFilters] = useState(() => buildInitialFilters(resource));
  const [page, setPage] = useState(1);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const requiredReferences = useMemo(() => {
    const names = new Set();
    resource.fields.forEach((field) => {
      if (field.reference) {
        names.add(field.reference);
      }
    });
    (resource.filters || []).forEach((field) => {
      if (field.reference) {
        names.add(field.reference);
      }
    });
    resource.columns.forEach((column) => {
      if (column.reference) {
        names.add(column.reference);
      }
    });
    return Array.from(names);
  }, [resource]);

  async function loadRecords(nextFilters = appliedFilters, nextPage = page) {
    setIsLoading(true);
    setError('');

    try {
      let result;
      const requestFilters = {
        ...nextFilters,
        page: nextPage,
        pageSize: LIST_PAGE_SIZE,
      };

      if (resource.kind === 'catalog') {
        result = await apiClient.listCatalog(resource.slug, requestFilters);
      } else if (resource.kind === 'users') {
        result = await apiClient.listUsers(requestFilters);
      } else {
        result = await apiClient.listDomains(requestFilters);
      }

      const nextRecords = result.data || [];

      setRecords(nextRecords);
      setMeta(result.meta || { page: nextPage, pageSize: LIST_PAGE_SIZE, total: nextRecords.length });
      setPage(Number(result.meta?.page || nextPage));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadReferences() {
    const entries = await Promise.all(requiredReferences.map(async (name) => {
      const definition = referenceDefinitions[name];

      if (!definition) {
        return [name, []];
      }

      const result = await apiClient.listAllCatalog(definition.slug);
      return [name, result.data];
    }));

    setReferences(Object.fromEntries(entries));
  }

  useEffect(() => {
    setForm(buildInitialForm(resource));
    const initialFilters = buildInitialFilters(resource);

    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setPage(1);
    setEditingRecord(null);
    setIsModalOpen(false);
    loadReferences().catch((referenceError) => setError(referenceError.message));
    loadRecords(initialFilters, 1).catch((recordError) => setError(recordError.message));
  }, [resource.key]);

  function handleChange(name, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleFilterChange(name, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  }

  function handleCreate() {
    setEditingRecord(null);
    setForm(buildInitialForm(resource));
    setIsModalOpen(true);
  }

  function handleEdit(record) {
    const nextForm = buildInitialForm(resource);

    resource.fields.forEach((field) => {
      if (field.optionalOnEdit) {
        nextForm[field.name] = '';
        return;
      }

      nextForm[field.name] = normalizeFieldValue(field, record[field.name] ?? getInitialValue(field));
    });

    setEditingRecord(record);
    setForm(nextForm);
    setIsModalOpen(true);
  }

  function handleCancel() {
    setEditingRecord(null);
    setForm(buildInitialForm(resource));
    setIsModalOpen(false);
  }

  async function handleExport() {
    setError('');
    setIsExporting(true);

    try {
      const result = await apiClient.listAllDomains(appliedFilters);
      const exportRecords = result.data || [];

      if (!exportRecords.length) {
        setError('No hay dominios disponibles para exportar.');
        return;
      }

      const headers = resource.columns.map((column) => `<th>${escapeSpreadsheetCell(column.label)}</th>`).join('');
      const rows = exportRecords.map((record) => {
        const cells = resource.columns
          .map((column) => `<td>${escapeSpreadsheetCell(formatCell(record, column, references))}</td>`)
          .join('');

        return `<tr>${cells}</tr>`;
      }).join('');
      const workbook = `
        <html>
          <head>
            <meta charset="UTF-8" />
          </head>
          <body>
            <table>
              <thead><tr>${headers}</tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </body>
        </html>
      `;

      downloadFile(
        workbook,
        `inventario-dominios-${formatDate(new Date())}.xls`,
        'application/vnd.ms-excel;charset=utf-8',
      );
    } catch (exportError) {
      setError(exportError.message);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const payload = normalizePayload(resource, form, editingRecord);

      if (resource.kind === 'catalog') {
        if (editingRecord) {
          await apiClient.updateCatalog(resource.slug, editingRecord.id, payload);
        } else {
          await apiClient.createCatalog(resource.slug, payload);
        }
      } else if (resource.kind === 'users') {
        if (editingRecord) {
          await apiClient.updateUser(editingRecord.id, payload);
        } else {
          await apiClient.createUser(payload);
        }
      } else if (editingRecord) {
        await apiClient.updateDomain(editingRecord.id, payload);
      } else {
        await apiClient.createDomain(payload);
      }

      handleCancel();
      await Promise.all([loadReferences(), loadRecords(appliedFilters, page)]);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(record) {
    if (!window.confirm(`¿Eliminar el registro #${record.id} de ${resource.title}?`)) {
      return;
    }

    setError('');

    try {
      if (resource.kind === 'catalog') {
        await apiClient.deleteCatalog(resource.slug, record.id);
      } else if (resource.kind === 'users') {
        await apiClient.deleteUser(record.id);
      } else {
        await apiClient.deleteDomain(record.id);
      }

      const nextPage = records.length === 1 && page > 1 ? page - 1 : page;
      await loadRecords(appliedFilters, nextPage);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  function handleFilterSubmit(event) {
    event.preventDefault();
    setAppliedFilters(filters);
    loadRecords(filters, 1);
  }

  function handleFilterReset() {
    const initialFilters = buildInitialFilters(resource);
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    loadRecords(initialFilters, 1);
  }

  const currentPage = Number(meta.page || page || 1);
  const pageSize = Number(meta.pageSize || LIST_PAGE_SIZE);
  const totalRecords = Number(meta.total || 0);
  const totalPages = Math.max(Math.ceil(totalRecords / pageSize), 1);
  const pageStart = totalRecords ? ((currentPage - 1) * pageSize) + 1 : 0;
  const pageEnd = Math.min(currentPage * pageSize, totalRecords);

  function handlePageChange(nextPage) {
    const boundedPage = Math.min(Math.max(nextPage, 1), totalPages);

    if (boundedPage !== currentPage) {
      loadRecords(appliedFilters, boundedPage);
    }
  }

  return (
    <main className="content-area">
      <section className="page-heading">
        <div>
          <p className="eyebrow">{meta.total} registros</p>
          <h1>{resource.title}</h1>
          <span>{resource.subtitle}</span>
        </div>
        <div className="page-actions">
          {resource.key === 'domains' && (
            <button className="secondary-button" type="button" onClick={handleExport} disabled={!totalRecords || isExporting}>
              <Download size={16} />
              {isExporting ? 'Exportando' : 'Exportar Excel'}
            </button>
          )}
          <button className="secondary-button" type="button" onClick={() => loadRecords(appliedFilters, page)}>
            <RefreshCw size={16} />
            Actualizar
          </button>
          <button className="primary-button" type="button" onClick={handleCreate}>
            <Plus size={17} />
            Nuevo registro
          </button>
        </div>
      </section>

      {error && <div className="alert-error">{error}</div>}

      <section className="crud-grid">
        <section className="panel data-table-panel">
          <div className="table-toolbar">
            <form className="filters-form" onSubmit={handleFilterSubmit}>
              {(resource.filters || []).map((field) => (
                <label className="filter-field" key={field.name} htmlFor={`filter-${field.name}`}>
                  <span>{field.label}</span>
                  <FilterInput
                    field={field}
                    value={filters[field.name]}
                    onChange={handleFilterChange}
                    references={references}
                  />
                </label>
              ))}
              <div className="filter-actions">
                <button className="secondary-button" type="button" onClick={handleFilterReset}>
                  <X size={16} />
                  Limpiar
                </button>
                <button className="primary-button" type="submit">
                  <Search size={16} />
                  Buscar
                </button>
              </div>
            </form>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {resource.columns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    {resource.columns.map((column) => (
                      <td key={column.key}>{formatCell(record, column, references)}</td>
                    ))}
                    <td>
                      <div className="row-actions">
                        <button className="icon-button" type="button" onClick={() => handleEdit(record)} title="Editar">
                          <Edit3 size={16} />
                        </button>
                        <button className="icon-button danger" type="button" onClick={() => handleDelete(record)} title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!records.length && (
                  <tr>
                    <td colSpan={resource.columns.length + 1}>
                      <div className="empty-state">
                        {isLoading ? 'Cargando registros' : 'No se encontraron registros'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-bar">
            <span>
              {totalRecords ? `${pageStart}-${pageEnd} de ${totalRecords} registros` : '0 registros'}
            </span>
            <div>
              <button
                className="secondary-button pagination-button"
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={isLoading || currentPage <= 1}
              >
                <ChevronLeft size={16} />
                Anterior
              </button>
              <strong>Página {currentPage} de {totalPages}</strong>
              <button
                className="secondary-button pagination-button"
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={isLoading || currentPage >= totalPages}
              >
                Siguiente
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="record-modal-title">
            <form className="data-form" onSubmit={handleSubmit}>
              <div className="modal-header">
                <div>
                  <p className="eyebrow">{resource.title}</p>
                  <h2 id="record-modal-title">{editingRecord ? 'Editar registro' : 'Nuevo registro'}</h2>
                </div>
                <button className="icon-button" type="button" onClick={handleCancel} title="Cerrar">
                  <X size={18} />
                </button>
              </div>

              <div className="form-grid modal-form-grid">
                {resource.fields.map((field) => (
                  <label
                    className={field.type === 'checkbox' ? 'checkbox-field' : 'form-field'}
                    key={field.name}
                    htmlFor={field.name}
                  >
                    <span>{field.label}</span>
                    <FieldInput
                      field={field}
                      value={form[field.name]}
                      onChange={handleChange}
                      references={references}
                      editingRecord={editingRecord}
                    />
                  </label>
                ))}
              </div>

              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={handleCancel}>
                  <X size={16} />
                  Cancelar
                </button>
                <button className="primary-button" type="submit" disabled={isSaving}>
                  {editingRecord ? <Save size={17} /> : <Plus size={17} />}
                  {isSaving ? 'Guardando' : editingRecord ? 'Guardar cambios' : 'Crear'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
