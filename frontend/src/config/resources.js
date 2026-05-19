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

export const resources = [
  {
    key: 'domains',
    title: 'Domain Inventory',
    subtitle: 'Purchased domains, renewal action, provider costs, taxes and USD totals.',
    kind: 'domains',
    path: '/domains',
    accent: 'blue',
    columns: [
      { key: 'domain_name', label: 'Domain' },
      { key: 'provider_name', label: 'Provider' },
      { key: 'extension', label: 'Extension' },
      { key: 'expiration_date', label: 'Expiration' },
      { key: 'domain_action_name', label: 'Action' },
      { key: 'total_amount', label: 'Total' },
      { key: 'total_usd_amount', label: 'Total USD' },
      { key: 'is_active', label: 'Active', type: 'boolean' },
    ],
    fields: [
      { name: 'domain_name', label: 'Domain name', type: 'text', required: true },
      { name: 'domain_provider_id', label: 'Provider', type: 'select', reference: 'domainProviders', required: true },
      { name: 'domain_extension_id', label: 'Extension', type: 'select', reference: 'domainExtensions', labelProperty: 'extension', required: true },
      { name: 'domain_type_id', label: 'Type', type: 'select', reference: 'domainTypes', required: true },
      { name: 'domain_action_id', label: 'Action', type: 'select', reference: 'domainActions', required: true },
      { name: 'dns_service_price_id', label: 'DNS service', type: 'select', reference: 'providerServicePrices', optionLabel: servicePriceLabel, filter: (item) => item.service_type === 'dns', nullable: true },
      { name: 'security_service_price_id', label: 'Security service', type: 'select', reference: 'providerServicePrices', optionLabel: servicePriceLabel, filter: (item) => item.service_type === 'security', nullable: true },
      { name: 'expiration_date', label: 'Expiration date', type: 'date', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea', nullable: true },
      { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'users',
    title: 'Users',
    subtitle: 'System users with assigned roles and login access.',
    kind: 'users',
    path: '/users',
    accent: 'purple',
    columns: [
      { key: 'first_name', label: 'First name' },
      { key: 'last_name', label: 'Last name' },
      { key: 'email', label: 'Email' },
      { key: 'role_name', label: 'Role' },
      { key: 'last_login_at', label: 'Last login' },
      { key: 'is_active', label: 'Active', type: 'boolean' },
    ],
    fields: [
      { name: 'first_name', label: 'First name', type: 'text', required: true },
      { name: 'last_name', label: 'Last name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true, optionalOnEdit: true },
      { name: 'role_id', label: 'Role', type: 'select', reference: 'roles', required: true },
      { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'roles',
    title: 'Roles',
    subtitle: 'Permission profiles for backend access.',
    kind: 'catalog',
    slug: 'roles',
    accent: 'teal',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'is_active', label: 'Active', type: 'boolean' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', nullable: true },
      { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'domain-providers',
    title: 'Domain Providers',
    subtitle: 'Registrars and vendors used to acquire domains.',
    kind: 'catalog',
    slug: 'domain-providers',
    accent: 'green',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'website_url', label: 'Website' },
      { key: 'support_email', label: 'Support email' },
      { key: 'is_active', label: 'Active', type: 'boolean' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'website_url', label: 'Website URL', type: 'text', nullable: true },
      { name: 'support_email', label: 'Support email', type: 'email', nullable: true },
      { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'domain-extensions',
    title: 'Domain Extensions',
    subtitle: 'TLD catalog for domains such as .com, .mx or .net.',
    kind: 'catalog',
    slug: 'domain-extensions',
    accent: 'red',
    columns: [
      { key: 'extension', label: 'Extension' },
      { key: 'description', label: 'Description' },
      { key: 'is_active', label: 'Active', type: 'boolean' },
    ],
    fields: [
      { name: 'extension', label: 'Extension', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', nullable: true },
      { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'domain-types',
    title: 'Domain Types',
    subtitle: 'Business classification for each acquired domain.',
    kind: 'catalog',
    slug: 'domain-types',
    accent: 'indigo',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'is_active', label: 'Active', type: 'boolean' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', nullable: true },
      { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'domain-actions',
    title: 'Domain Actions',
    subtitle: 'Renewal, cancellation or follow-up actions assigned to domains.',
    kind: 'catalog',
    slug: 'domain-actions',
    accent: 'amber',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'is_active', label: 'Active', type: 'boolean' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', nullable: true },
      { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'provider-extension-prices',
    title: 'Extension Prices',
    subtitle: 'Provider-specific domain extension prices.',
    kind: 'catalog',
    slug: 'provider-extension-prices',
    accent: 'violet',
    columns: [
      { key: 'domain_provider_id', label: 'Provider', reference: 'domainProviders' },
      { key: 'domain_extension_id', label: 'Extension', reference: 'domainExtensions', labelProperty: 'extension' },
      { key: 'price_amount', label: 'Price' },
      { key: 'currency_code', label: 'Currency' },
      { key: 'effective_from', label: 'From' },
      { key: 'is_active', label: 'Active', type: 'boolean' },
    ],
    fields: [
      { name: 'domain_provider_id', label: 'Provider', type: 'select', reference: 'domainProviders', required: true },
      { name: 'domain_extension_id', label: 'Extension', type: 'select', reference: 'domainExtensions', labelProperty: 'extension', required: true },
      { name: 'price_amount', label: 'Price amount', type: 'number', required: true },
      { name: 'currency_code', label: 'Currency', type: 'text', required: true, defaultValue: 'MXN' },
      { name: 'effective_from', label: 'Effective from', type: 'date', required: true, defaultValue: today },
      { name: 'effective_to', label: 'Effective to', type: 'date', nullable: true },
      { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'provider-service-prices',
    title: 'Service Prices',
    subtitle: 'Provider-specific DNS and security add-on costs.',
    kind: 'catalog',
    slug: 'provider-service-prices',
    accent: 'cyan',
    columns: [
      { key: 'domain_provider_id', label: 'Provider', reference: 'domainProviders' },
      { key: 'service_type', label: 'Type' },
      { key: 'service_name', label: 'Service' },
      { key: 'price_amount', label: 'Price' },
      { key: 'currency_code', label: 'Currency' },
      { key: 'is_active', label: 'Active', type: 'boolean' },
    ],
    fields: [
      { name: 'domain_provider_id', label: 'Provider', type: 'select', reference: 'domainProviders', required: true },
      { name: 'service_type', label: 'Service type', type: 'select', required: true, staticOptions: [{ value: 'dns', label: 'DNS' }, { value: 'security', label: 'Security' }] },
      { name: 'service_name', label: 'Service name', type: 'text', required: true },
      { name: 'price_amount', label: 'Price amount', type: 'number', required: true },
      { name: 'currency_code', label: 'Currency', type: 'text', required: true, defaultValue: 'MXN' },
      { name: 'effective_from', label: 'Effective from', type: 'date', required: true, defaultValue: today },
      { name: 'effective_to', label: 'Effective to', type: 'date', nullable: true },
      { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
    ],
  },
  {
    key: 'financial-settings',
    title: 'Financial Settings',
    subtitle: 'USD exchange rate and VAT configuration.',
    kind: 'catalog',
    slug: 'financial-settings',
    accent: 'orange',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'base_currency_code', label: 'Base currency' },
      { key: 'usd_exchange_rate', label: 'USD rate' },
      { key: 'vat_rate', label: 'VAT rate' },
      { key: 'effective_from', label: 'From' },
      { key: 'is_active', label: 'Active', type: 'boolean' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'base_currency_code', label: 'Base currency', type: 'text', required: true, defaultValue: 'MXN' },
      { name: 'usd_exchange_rate', label: 'USD exchange rate', type: 'number', required: true },
      { name: 'vat_rate', label: 'VAT rate', type: 'number', required: true, defaultValue: '0.16' },
      { name: 'effective_from', label: 'Effective from', type: 'date', required: true, defaultValue: today },
      { name: 'effective_to', label: 'Effective to', type: 'date', nullable: true },
      { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
    ],
  },
];
