function today() {
  return new Date().toISOString().slice(0, 10);
}

function findById(options, key, id) {
  return options[key]?.find((item) => Number(item.id) === Number(id));
}

function optionName(options, key, id, property = 'name') {
  const record = findById(options, key, id);
  return record?.[property] || `#${id}`;
}

function servicePriceLabel(item, options) {
  const provider = optionName(options, 'domainProviders', item.domain_provider_id);
  return `${provider} / ${item.service_name} - ${item.currency_code} ${item.price_amount}`;
}

export const referenceDefinitions = {
  roles: { kind: 'catalog', slug: 'roles' },
  domainProviders: { kind: 'catalog', slug: 'domain-providers' },
  domainExtensions: { kind: 'catalog', slug: 'domain-extensions' },
  domainTypes: { kind: 'catalog', slug: 'domain-types' },
  domainActions: { kind: 'catalog', slug: 'domain-actions' },
  providerServicePrices: { kind: 'catalog', slug: 'provider-service-prices' },
};

const statusOptions = [
  { value: 'true', label: 'Activo' },
  { value: 'false', label: 'Inactivo' },
];

const serviceTypeOptions = [
  { value: 'dns', label: 'DNS' },
  { value: 'security', label: 'Seguridad' },
];

export const resources = [
  {
    key: 'domains',
    title: 'Inventario de Dominios',
    subtitle: 'Dominios adquiridos, acción de seguimiento, costos por proveedor, impuestos y totales en USD.',
    kind: 'domains',
    path: '/domains',
    accent: 'blue',
    columns: [
      { key: 'domain_name', label: 'Dominio' },
      { key: 'provider_name', label: 'Proveedor' },
      { key: 'extension', label: 'Extensión' },
      { key: 'expiration_date', label: 'Vencimiento', type: 'date' },
      { key: 'domain_action_name', label: 'Acción' },
      { key: 'total_amount', label: 'Total' },
      { key: 'total_usd_amount', label: 'Total USD' },
      { key: 'is_active', label: 'Activo', type: 'boolean' },
    ],
    filters: [
      { name: 'search', label: 'Buscar', type: 'search', placeholder: 'Dominio, proveedor, extensión' },
      { name: 'domain_provider_id', label: 'Proveedor', type: 'select', reference: 'domainProviders' },
      { name: 'domain_extension_id', label: 'Extensión', type: 'select', reference: 'domainExtensions', labelProperty: 'extension' },
      { name: 'domain_type_id', label: 'Tipo', type: 'select', reference: 'domainTypes' },
      { name: 'domain_action_id', label: 'Acción', type: 'select', reference: 'domainActions' },
      { name: 'expiration_from', label: 'Vence desde', type: 'date' },
      { name: 'expiration_to', label: 'Vence hasta', type: 'date' },
      { name: 'is_active', label: 'Estatus', type: 'select', staticOptions: statusOptions },
    ],
    fields: [
      { name: 'domain_name', label: 'Nombre de dominio', type: 'text', required: true },
      { name: 'domain_provider_id', label: 'Proveedor', type: 'select', reference: 'domainProviders', required: true },
      { name: 'domain_extension_id', label: 'Extensión', type: 'select', reference: 'domainExtensions', labelProperty: 'extension', required: true },
      { name: 'domain_type_id', label: 'Tipo', type: 'select', reference: 'domainTypes', required: true },
      { name: 'domain_action_id', label: 'Acción', type: 'select', reference: 'domainActions', required: true },
      { name: 'dns_service_price_id', label: 'Servicio DNS', type: 'select', reference: 'providerServicePrices', optionLabel: servicePriceLabel, filter: (item) => item.service_type === 'dns', nullable: true },
      { name: 'security_service_price_id', label: 'Servicio de seguridad', type: 'select', reference: 'providerServicePrices', optionLabel: servicePriceLabel, filter: (item) => item.service_type === 'security', nullable: true },
      { name: 'expiration_date', label: 'Fecha de vencimiento', type: 'date', required: true },
      { name: 'notes', label: 'Notas', type: 'textarea', nullable: true },
      { name: 'is_active', label: 'Activo', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'users',
    title: 'Usuarios',
    subtitle: 'Usuarios del sistema con rol asignado y acceso de inicio de sesión.',
    kind: 'users',
    path: '/users',
    accent: 'purple',
    columns: [
      { key: 'first_name', label: 'Nombre' },
      { key: 'last_name', label: 'Apellido' },
      { key: 'email', label: 'Correo' },
      { key: 'role_name', label: 'Rol' },
      { key: 'last_login_at', label: 'Último acceso', type: 'datetime' },
      { key: 'is_active', label: 'Activo', type: 'boolean' },
    ],
    filters: [
      { name: 'search', label: 'Buscar', type: 'search', placeholder: 'Nombre, correo, rol' },
      { name: 'role_id', label: 'Rol', type: 'select', reference: 'roles' },
      { name: 'is_active', label: 'Estatus', type: 'select', staticOptions: statusOptions },
    ],
    fields: [
      { name: 'first_name', label: 'Nombre', type: 'text', required: true },
      { name: 'last_name', label: 'Apellido', type: 'text', required: true },
      { name: 'email', label: 'Correo', type: 'email', required: true },
      { name: 'password', label: 'Contraseña', type: 'password', required: true, optionalOnEdit: true },
      { name: 'role_id', label: 'Rol', type: 'select', reference: 'roles', required: true },
      { name: 'is_active', label: 'Activo', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'roles',
    title: 'Roles',
    subtitle: 'Perfiles de permisos para acceso al sistema.',
    kind: 'catalog',
    slug: 'roles',
    accent: 'teal',
    columns: [
      { key: 'name', label: 'Nombre' },
      { key: 'description', label: 'Descripción' },
      { key: 'is_active', label: 'Activo', type: 'boolean' },
    ],
    filters: [
      { name: 'search', label: 'Buscar', type: 'search', placeholder: 'Nombre o descripción' },
      { name: 'is_active', label: 'Estatus', type: 'select', staticOptions: statusOptions },
    ],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'description', label: 'Descripción', type: 'textarea', nullable: true },
      { name: 'is_active', label: 'Activo', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'domain-providers',
    title: 'Proveedores de Dominio',
    subtitle: 'Registradores y proveedores usados para adquirir dominios.',
    kind: 'catalog',
    slug: 'domain-providers',
    accent: 'green',
    columns: [
      { key: 'name', label: 'Nombre' },
      { key: 'website_url', label: 'Sitio web' },
      { key: 'support_email', label: 'Correo de soporte' },
      { key: 'is_active', label: 'Activo', type: 'boolean' },
    ],
    filters: [
      { name: 'search', label: 'Buscar', type: 'search', placeholder: 'Proveedor, sitio web, correo' },
      { name: 'is_active', label: 'Estatus', type: 'select', staticOptions: statusOptions },
    ],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'website_url', label: 'URL del sitio web', type: 'text', nullable: true },
      { name: 'support_email', label: 'Correo de soporte', type: 'email', nullable: true },
      { name: 'is_active', label: 'Activo', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'domain-extensions',
    title: 'Extensiones de Dominio',
    subtitle: 'Catálogo de TLD para dominios como .com, .mx o .net.',
    kind: 'catalog',
    slug: 'domain-extensions',
    accent: 'red',
    columns: [
      { key: 'extension', label: 'Extensión' },
      { key: 'description', label: 'Descripción' },
      { key: 'is_active', label: 'Activo', type: 'boolean' },
    ],
    filters: [
      { name: 'search', label: 'Buscar', type: 'search', placeholder: 'Extensión o descripción' },
      { name: 'is_active', label: 'Estatus', type: 'select', staticOptions: statusOptions },
    ],
    fields: [
      { name: 'extension', label: 'Extensión', type: 'text', required: true },
      { name: 'description', label: 'Descripción', type: 'textarea', nullable: true },
      { name: 'is_active', label: 'Activo', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'domain-types',
    title: 'Tipos de Dominio',
    subtitle: 'Clasificación de negocio para cada dominio adquirido.',
    kind: 'catalog',
    slug: 'domain-types',
    accent: 'indigo',
    columns: [
      { key: 'name', label: 'Nombre' },
      { key: 'description', label: 'Descripción' },
      { key: 'is_active', label: 'Activo', type: 'boolean' },
    ],
    filters: [
      { name: 'search', label: 'Buscar', type: 'search', placeholder: 'Tipo o descripción' },
      { name: 'is_active', label: 'Estatus', type: 'select', staticOptions: statusOptions },
    ],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'description', label: 'Descripción', type: 'textarea', nullable: true },
      { name: 'is_active', label: 'Activo', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'domain-actions',
    title: 'Acciones de Dominio',
    subtitle: 'Renovación, cancelación o acciones de seguimiento asignadas a dominios.',
    kind: 'catalog',
    slug: 'domain-actions',
    accent: 'amber',
    columns: [
      { key: 'name', label: 'Nombre' },
      { key: 'description', label: 'Descripción' },
      { key: 'is_active', label: 'Activo', type: 'boolean' },
    ],
    filters: [
      { name: 'search', label: 'Buscar', type: 'search', placeholder: 'Acción o descripción' },
      { name: 'is_active', label: 'Estatus', type: 'select', staticOptions: statusOptions },
    ],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'description', label: 'Descripción', type: 'textarea', nullable: true },
      { name: 'is_active', label: 'Activo', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'provider-extension-prices',
    title: 'Precios por Extensión',
    subtitle: 'Precios de extensión de dominio específicos por proveedor.',
    kind: 'catalog',
    slug: 'provider-extension-prices',
    accent: 'violet',
    columns: [
      { key: 'domain_provider_id', label: 'Proveedor', reference: 'domainProviders' },
      { key: 'domain_extension_id', label: 'Extensión', reference: 'domainExtensions', labelProperty: 'extension' },
      { key: 'price_amount', label: 'Precio' },
      { key: 'currency_code', label: 'Moneda' },
      { key: 'effective_from', label: 'Desde', type: 'date' },
      { key: 'is_active', label: 'Activo', type: 'boolean' },
    ],
    filters: [
      { name: 'domain_provider_id', label: 'Proveedor', type: 'select', reference: 'domainProviders' },
      { name: 'domain_extension_id', label: 'Extensión', type: 'select', reference: 'domainExtensions', labelProperty: 'extension' },
      { name: 'currency_code', label: 'Moneda', type: 'text', placeholder: 'MXN' },
      { name: 'is_active', label: 'Estatus', type: 'select', staticOptions: statusOptions },
    ],
    fields: [
      { name: 'domain_provider_id', label: 'Proveedor', type: 'select', reference: 'domainProviders', required: true },
      { name: 'domain_extension_id', label: 'Extensión', type: 'select', reference: 'domainExtensions', labelProperty: 'extension', required: true },
      { name: 'price_amount', label: 'Importe', type: 'number', required: true },
      { name: 'currency_code', label: 'Moneda', type: 'text', required: true, defaultValue: 'MXN' },
      { name: 'effective_from', label: 'Vigente desde', type: 'date', required: true, defaultValue: today },
      { name: 'effective_to', label: 'Vigente hasta', type: 'date', nullable: true },
      { name: 'is_active', label: 'Activo', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'provider-service-prices',
    title: 'Precios de Servicios',
    subtitle: 'Costos adicionales de DNS y seguridad específicos por proveedor.',
    kind: 'catalog',
    slug: 'provider-service-prices',
    accent: 'cyan',
    columns: [
      { key: 'domain_provider_id', label: 'Proveedor', reference: 'domainProviders' },
      { key: 'service_type', label: 'Tipo' },
      { key: 'service_name', label: 'Servicio' },
      { key: 'price_amount', label: 'Precio' },
      { key: 'currency_code', label: 'Moneda' },
      { key: 'is_active', label: 'Activo', type: 'boolean' },
    ],
    filters: [
      { name: 'search', label: 'Buscar', type: 'search', placeholder: 'Servicio, tipo, moneda' },
      { name: 'domain_provider_id', label: 'Proveedor', type: 'select', reference: 'domainProviders' },
      { name: 'service_type', label: 'Tipo', type: 'select', staticOptions: serviceTypeOptions },
      { name: 'currency_code', label: 'Moneda', type: 'text', placeholder: 'MXN' },
      { name: 'is_active', label: 'Estatus', type: 'select', staticOptions: statusOptions },
    ],
    fields: [
      { name: 'domain_provider_id', label: 'Proveedor', type: 'select', reference: 'domainProviders', required: true },
      { name: 'service_type', label: 'Tipo de servicio', type: 'select', required: true, staticOptions: serviceTypeOptions },
      { name: 'service_name', label: 'Nombre del servicio', type: 'text', required: true },
      { name: 'price_amount', label: 'Importe', type: 'number', required: true },
      { name: 'currency_code', label: 'Moneda', type: 'text', required: true, defaultValue: 'MXN' },
      { name: 'effective_from', label: 'Vigente desde', type: 'date', required: true, defaultValue: today },
      { name: 'effective_to', label: 'Vigente hasta', type: 'date', nullable: true },
      { name: 'is_active', label: 'Activo', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'financial-settings',
    title: 'Configuración Financiera',
    subtitle: 'Configuración de tipo de cambio USD e IVA.',
    kind: 'catalog',
    slug: 'financial-settings',
    accent: 'orange',
    columns: [
      { key: 'name', label: 'Nombre' },
      { key: 'base_currency_code', label: 'Moneda base' },
      { key: 'usd_exchange_rate', label: 'Tipo USD' },
      { key: 'vat_rate', label: 'IVA' },
      { key: 'effective_from', label: 'Desde', type: 'date' },
      { key: 'is_active', label: 'Activo', type: 'boolean' },
    ],
    filters: [
      { name: 'search', label: 'Buscar', type: 'search', placeholder: 'Nombre o moneda' },
      { name: 'base_currency_code', label: 'Moneda base', type: 'text', placeholder: 'MXN' },
      { name: 'is_active', label: 'Estatus', type: 'select', staticOptions: statusOptions },
    ],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'base_currency_code', label: 'Moneda base', type: 'text', required: true, defaultValue: 'MXN' },
      { name: 'usd_exchange_rate', label: 'Tipo de cambio USD', type: 'number', required: true },
      { name: 'vat_rate', label: 'IVA', type: 'number', required: true, defaultValue: '0.16' },
      { name: 'effective_from', label: 'Vigente desde', type: 'date', required: true, defaultValue: today },
      { name: 'effective_to', label: 'Vigente hasta', type: 'date', nullable: true },
      { name: 'is_active', label: 'Activo', type: 'checkbox', defaultValue: true },
    ],
  },
];
