import { useEffect, useMemo, useState } from 'react';
import {
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
    [field.name]: getInitialValue(field),
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

function formatCell(row, column, references) {
  const value = row[column.key];

  if (column.type === 'boolean') {
    return value ? 'Yes' : 'No';
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
        <option value="">Select</option>
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
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.id || option.value} value={option.id || option.value}>
            {option.label || getOptionLabel(field, option, references)}
          </option>
        ))}
      </select>
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
  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  async function loadRecords(nextFilters = filters) {
    setIsLoading(true);
    setError('');

    try {
      let result;

      if (resource.kind === 'catalog') {
        result = await apiClient.listCatalog(resource.slug, nextFilters);
      } else if (resource.kind === 'users') {
        result = await apiClient.listUsers(nextFilters);
      } else {
        result = await apiClient.listDomains(nextFilters);
      }

      setRecords(result.data);
      setMeta(result.meta);
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

      const result = await apiClient.listCatalog(definition.slug);
      return [name, result.data];
    }));

    setReferences(Object.fromEntries(entries));
  }

  useEffect(() => {
    setForm(buildInitialForm(resource));
    setFilters(buildInitialFilters(resource));
    setEditingRecord(null);
    setIsModalOpen(false);
    loadReferences().catch((referenceError) => setError(referenceError.message));
    loadRecords(buildInitialFilters(resource)).catch((recordError) => setError(recordError.message));
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

      nextForm[field.name] = record[field.name] ?? getInitialValue(field);
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
      await Promise.all([loadReferences(), loadRecords(filters)]);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(record) {
    if (!window.confirm(`Delete ${resource.title} record #${record.id}?`)) {
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

      await loadRecords(filters);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  function handleFilterSubmit(event) {
    event.preventDefault();
    loadRecords(filters);
  }

  function handleFilterReset() {
    const initialFilters = buildInitialFilters(resource);
    setFilters(initialFilters);
    loadRecords(initialFilters);
  }

  return (
    <main className="content-area">
      <section className="page-heading">
        <div>
          <p className="eyebrow">{meta.total} records</p>
          <h1>{resource.title}</h1>
          <span>{resource.subtitle}</span>
        </div>
        <div className="page-actions">
          <button className="secondary-button" type="button" onClick={() => loadRecords(filters)}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="primary-button" type="button" onClick={handleCreate}>
            <Plus size={17} />
            New record
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
                  Clear
                </button>
                <button className="primary-button" type="submit">
                  <Search size={16} />
                  Search
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
                  <th>Actions</th>
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
                        <button className="icon-button" type="button" onClick={() => handleEdit(record)} title="Edit">
                          <Edit3 size={16} />
                        </button>
                        <button className="icon-button danger" type="button" onClick={() => handleDelete(record)} title="Delete">
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
                        {isLoading ? 'Loading records' : 'No records found'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
                  <h2 id="record-modal-title">{editingRecord ? 'Edit record' : 'New record'}</h2>
                </div>
                <button className="icon-button" type="button" onClick={handleCancel} title="Close">
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
                  Cancel
                </button>
                <button className="primary-button" type="submit" disabled={isSaving}>
                  {editingRecord ? <Save size={17} /> : <Plus size={17} />}
                  {isSaving ? 'Saving' : editingRecord ? 'Save changes' : 'Create'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
