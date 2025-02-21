// Root
export interface Root {
    languages: Language[];
}

// Individual langues
export interface Language {
    alias: string;
    id: string;
    extension: string;
    requireNamespace: boolean;
    templates: Templates[];
}

// Individual templates
export interface Templates {
    alias: string;
    description: string;
    fileName: string;
    extensionOverride?: string;
    snippet: string[];
}
