export const RULES = Object.freeze({
  parse: {
    id: 'MDG000',
    severity: 'error',
    description: 'Source could not be parsed, so Guard could not validate it.',
  },
  unknownComponent: {
    id: 'MDG001',
    severity: 'error',
    description: 'Imported Meridian component does not exist.',
  },
  unknownIcon: {
    id: 'MDG002',
    severity: 'error',
    description: 'Icon name does not exist in the Meridian icon set.',
  },
  rawColor: {
    id: 'MDG003',
    severity: 'warning',
    description: 'Raw colors bypass Meridian semantic tokens.',
  },
  deprecatedApi: {
    id: 'MDG004',
    severity: 'warning',
    description: 'Deprecated Meridian API should be replaced by its canonical API.',
  },
  accessibility: {
    id: 'MDG005',
    severity: 'error',
    description: 'Meridian accessibility contract is incomplete.',
  },
  unknownToken: {
    id: 'MDG006',
    severity: 'error',
    description: 'Referenced Meridian design token does not exist.',
  },
});
