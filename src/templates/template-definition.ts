// Root
export interface Root {
    languages: Language[];
}

// Individual langues
export interface Language {
    alias: string;
    id: string;
    description: string;
    extension: string;
    requireNamespace?: boolean;
    templates: Template[];
}

// Individual templates
export interface Template {
    alias: string;
    id: string;
    description: string;
    fileName: string;
    extensionOverride?: string;
    snippet?: string[];
    children?: string;
}
