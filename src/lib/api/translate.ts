import axios from 'axios';

const API_URL = 'https://api.mymemory.translated.net/get';

interface MyMemoryResponse {
    responseData: {
        translatedText: string;
        match: number;
    };
    quotaFinished?: boolean;
    responseDetails?: string;
    responseStatus: string;
    responderId: string;
    exception_code?: string;
}

export const translateText = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
    try {
        const sourceParam = sourceLang === 'auto' ? '' : sourceLang;
        const langPair = `${sourceParam}|${targetLang}`;

        const response = await axios.get<MyMemoryResponse>(API_URL, {
            params: {
                q: text,
                langpair: langPair,
            }
        });

        if (response.data.quotaFinished) {
            new Error('Limite quotidienne de traduction atteinte');
        }

        if (response.data.responseStatus === '403') {
            new Error('Service temporairement indisponible');
        }

        return response.data.responseData.translatedText;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error('Erreur réseau:', error.message);
            throw new Error('Erreur de connexion au service de traduction');
        }
        console.error('Erreur de traduction:', error);
        throw error;
    }
};

export const getSupportedLanguages = async () => {
    return Promise.resolve([
        { code: 'fr', name: 'Français' },
        { code: 'en', name: 'Anglais' },
        { code: 'es', name: 'Espagnol' },
        { code: 'de', name: 'Allemand' },
        { code: 'it', name: 'Italien' },
        { code: 'pt', name: 'Portugais' },
        { code: 'nl', name: 'Néerlandais' },
        { code: 'ru', name: 'Russe' },
        { code: 'ja', name: 'Japonais' },
        { code: 'zh', name: 'Chinois' },
        { code: 'ar', name: 'Arabe' },
        { code: 'ko', name: 'Coréen' }
    ]);
};