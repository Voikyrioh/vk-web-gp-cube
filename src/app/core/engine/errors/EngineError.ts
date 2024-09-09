export enum EngineErrorType {
    NAVIGATOR_INCOMPATIBILITY = 'NAVIGATOR_INCOMPATIBILITY',
    WPGU_NOT_ACTIVATED = 'WPGU_NOT_ACTIVATED',
    MINIMAL_CONFIGURATION = 'MINIMAL_CONFIGURATION',
}

export class EngineError extends Error {
    private static ErrorMessages: Record<EngineErrorType, string> = {
        [EngineErrorType.NAVIGATOR_INCOMPATIBILITY]: 'Navigator is incompatible',
        [EngineErrorType.WPGU_NOT_ACTIVATED]: 'WPGU is not activated or not supported',
        [EngineErrorType.MINIMAL_CONFIGURATION]: 'Your configuration does not meet required functionalities',
    }

    constructor(errorType: EngineErrorType) {
        super(EngineError.ErrorMessages[errorType]);
    }
}
