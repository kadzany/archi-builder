export type CapabilityCatalogItem = {
    id: string;        // e.g., 'cap-billing'
    label: string;     // display
    color?: string;    // optional tint
    icon?: string;     // lucide icon
};

export const CAPABILITY_CATALOG: ReadonlyArray<CapabilityCatalogItem> = [
    { id: 'cap-billing', label: 'Billing & Revenue Management', color: '#3b82f6', icon: 'Boxes' },
    { id: 'cap-order', label: 'Order Management', color: '#3b82f6', icon: 'Boxes' },
    { id: 'cap-product', label: 'Product & Catalog Management', color: '#3b82f6', icon: 'Boxes' },
    { id: 'cap-fulfilment', label: 'Service Fulfilment', color: '#3b82f6', icon: 'Boxes' },
    { id: 'cap-partner', label: 'Partnership & Channel Mgmt', color: '#3b82f6', icon: 'Boxes' },
    { id: 'cap-payment', label: 'Payment & Settlement', color: '#3b82f6', icon: 'Boxes' },
    { id: 'cap-customer', label: 'Customer Experience & NPS', color: '#3b82f6', icon: 'Boxes' },
    { id: 'cap-finance', label: 'Finance & Accounting', color: '#3b82f6', icon: 'Boxes' },
    { id: 'cap-marketplace', label: 'Marketplace Management', color: '#3b82f6', icon: 'Boxes' },
    { id: 'cap-analytics', label: 'Data Analytics', color: '#3b82f6', icon: 'Boxes' },
    { id: 'cap-hr', label: 'Human Capital Management', color: '#3b82f6', icon: 'Boxes' },
] as const;

export type ApplicationCatalogItem = {
    label: string;          // display
    capabilityRef?: string; // link to capability id
    color?: string;         // optional tint
    icon?: string;          // lucide icon
};

export const APPLICATION_CATALOG: ReadonlyArray<ApplicationCatalogItem> = [
    { label: 'FAB Revenue', capabilityRef: 'cap-billing', icon: 'AppWindow', color: '#10b981' },
    { label: 'FAB Order', capabilityRef: 'cap-order', icon: 'AppWindow', color: '#10b981' },
    { label: 'FAB Product', capabilityRef: 'cap-product', icon: 'AppWindow', color: '#10b981' },
    { label: 'FAB Provisioning/Fulfilment', capabilityRef: 'cap-fulfilment', icon: 'AppWindow', color: '#10b981' },
    { label: 'Odissey', capabilityRef: 'cap-fulfilment', icon: 'AppWindow', color: '#10b981' },
    { label: 'TPN (Partnerships)', capabilityRef: 'cap-partner', icon: 'AppWindow', color: '#10b981' },
    { label: 'Cazz', capabilityRef: 'cap-payment', icon: 'AppWindow', color: '#10b981' },
    { label: 'TMoney', capabilityRef: 'cap-payment', icon: 'AppWindow', color: '#10b981' },
    { label: 'MyIB Marketplace', capabilityRef: 'cap-marketplace', icon: 'AppWindow', color: '#10b981' },
    { label: 'Octopus Product Taxonomy', capabilityRef: 'cap-product', icon: 'AppWindow', color: '#10b981' },
    { label: 'Prometix NPS', capabilityRef: 'cap-customer', icon: 'AppWindow', color: '#10b981' },
    { label: 'FINEST', capabilityRef: 'cap-finance', icon: 'AppWindow', color: '#10b981' },
    { label: 'Pijar', capabilityRef: 'cap-marketplace', icon: 'AppWindow', color: '#10b981' },
    { label: 'Bigbox', capabilityRef: 'cap-marketplace', icon: 'AppWindow', color: '#10b981' },
    { label: 'PADI', capabilityRef: 'cap-marketplace', icon: 'AppWindow', color: '#10b981' },
    { label: 'SCOne', capabilityRef: 'cap-order', icon: 'AppWindow', color: '#10b981' },
    { label: 'Bisown', capabilityRef: 'cap-analytics', icon: 'AppWindow', color: '#10b981' },
    { label: 'HCIS', capabilityRef: 'cap-hr', icon: 'AppWindow', color: '#10b981' },
    { label: 'EBanking', capabilityRef: 'cap-payment', icon: 'AppWindow', color: '#10b981' },
] as const;
