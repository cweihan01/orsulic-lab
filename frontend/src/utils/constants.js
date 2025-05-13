/** Max number of queries in query history */
export const MAX_QUERY_HISTORY_LENGTH = 20;

/** Number of results in table to display at once */
export const RESULTS_INCREMENT = 50;

/** List of different correlation types corresponding exactly to API key */
const SPEARMAN = 'spearman';
const ANOVA = 'anova';
const CHISQUARED = 'chisquared';
export const TAB_TYPES = { SPEARMAN, ANOVA, CHISQUARED };
export const TAB_KEYS = [SPEARMAN, ANOVA, CHISQUARED];

/** Map each correlation type to human-readable format */
export const TAB_DISPLAY_NAMES = {
    spearman: 'Spearman',
    anova: 'ANOVA',
    chisquared: 'Chi-Square',
};

/** Map each DepMap ID to cell line human-readable name */
export const DEPMAP_TO_CELLLINE_ID = {
    'ACH-000657': 'A2780',
    'ACH-001278': 'BIN67',
    'ACH-000713': 'CAOV3',
    'ACH-001042': 'COLO704',
    'ACH-000256': 'COV318',
    'ACH-000278': 'COV362',
    'ACH-000123': 'COV434',
    'ACH-001048': 'COV504',
    'ACH-000608': 'COV644',
    'ACH-001063': 'DOV13',
    'ACH-000906': 'ES2',
    'ACH-000574': 'FUOV1',
    'ACH-002140': 'HEY',
    'ACH-000542': 'HEYA8',
    'ACH-000324': 'JHOC5',
    'ACH-000237': 'JHOM1',
    'ACH-000132': 'JHOS2',
    'ACH-002149': 'KGN',
    'ACH-000524': 'KURAMOCHI',
    'ACH-000796': 'MCAS',
    'ACH-000001': 'NIHOVCAR3',
    'ACH-000116': 'OAW28',
    'ACH-000704': 'OAW42',
    'ACH-000091': 'OV56',
    'ACH-000688': 'OV7',
    'ACH-000291': 'OV90',
    'ACH-002181': 'OVCA420',
    'ACH-002182': 'OVCA433',
    'ACH-000617': 'OVCAR4',
    'ACH-001151': 'OVCAR5',
    'ACH-000696': 'OVCAR8',
    'ACH-000527': 'OVISE',
    'ACH-000947': 'OVK18',
    'ACH-000443': 'OVKATE',
    'ACH-000646': 'OVMANA',
    'ACH-000409': 'OVSAHO',
    'ACH-000663': 'OVTOKO',
    'ACH-001374': 'PA1',
    'ACH-001628': 'PEA1',
    'ACH-001630': 'PEO1',
    'ACH-001632': 'PEO4',
    'ACH-000719': 'RMGI',
    'ACH-000701': 'RMUGS',
    'ACH-000811': 'SKOV3',
    'ACH-000460': 'SNU8',
    'ACH-001403': 'TO14',
    'ACH-000048': 'TOV112D',
    'ACH-000885': 'TOV21G',
    'ACH-000430': 'TYKNU',
    'ACH-001418': 'UWB1289',
};
