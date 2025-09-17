# Tech Debt: Class Component Modernization

## Story ID: 013
## Priority: 08 (Medium)
## Type: Tech Debt - Code Modernization

## Background

The ErrorBoundary component is the last remaining class component in the codebase. This blocks adoption of modern React features (hooks, concurrent features, Suspense integration) and creates inconsistency in the codebase. React's future optimizations favor function components with hooks.

## Current State

### Remaining Class Component:
- **File**: `src/components/ErrorBoundary/ErrorBoundary.js`
- **Type**: React.Component class
- **React Version**: Currently compatible
- **Future Risk**: May break with React 19+

### Impact:
- Cannot use hooks in error handling
- Inconsistent with rest of codebase (all functional)
- Blocks modern React features adoption
- Harder to test and maintain
- Prevents use of error boundary hooks (future React)

### Current Implementation:
```javascript
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

## Requirements

### Primary Goal
Convert the ErrorBoundary to use modern React patterns while maintaining its error catching functionality and enhancing it with better error recovery and reporting features.

### Constraints
- Error boundaries MUST be class components in React 18
- React 19 will introduce error boundary hooks
- Need backward compatibility until React 19

### Strategy
Create a hybrid approach that prepares for React 19 while working in React 18:
1. Keep minimal class wrapper for error boundary
2. Extract all logic to custom hooks
3. Create functional components for UI
4. Prepare for easy migration to React 19

## Implementation Tasks

### Phase 1: Extract Error Logic to Hooks

1. **Create Error Management Hook** (`src/hooks/useErrorHandler.js`)
   ```javascript
   export const useErrorHandler = () => {
     const [error, setError] = useState(null);
     const [errorInfo, setErrorInfo] = useState(null);
     const [errorCount, setErrorCount] = useState(0);
     const [isRecovering, setIsRecovering] = useState(false);
     
     const resetError = useCallback(() => {
       setError(null);
       setErrorInfo(null);
       setIsRecovering(false);
     }, []);
     
     const logError = useCallback((error, errorInfo) => {
       // Log to service
       if (typeof window !== 'undefined' && window.Sentry) {
         window.Sentry.captureException(error, {
           contexts: { react: errorInfo }
         });
       }
       
       // Log to console in dev
       if (process.env.NODE_ENV === 'development') {
         console.error('Error caught:', error);
         console.error('Error info:', errorInfo);
       }
       
       // Store for display
       setError(error);
       setErrorInfo(errorInfo);
       setErrorCount(prev => prev + 1);
     }, []);
     
     const recoverError = useCallback(async () => {
       setIsRecovering(true);
       
       try {
         // Clear corrupted data if needed
         if (error?.code === 'STORAGE_ERROR') {
           await clearCorruptedStorage();
         }
         
         // Reset app state if needed
         if (error?.code === 'STATE_ERROR') {
           await resetAppState();
         }
         
         resetError();
       } catch (recoveryError) {
         console.error('Recovery failed:', recoveryError);
         // Force reload as last resort
         window.location.reload();
       }
     }, [error, resetError]);
     
     return {
       error,
       errorInfo,
       errorCount,
       isRecovering,
       logError,
       resetError,
       recoverError
     };
   };
   ```

2. **Create Error Display Hook** (`src/hooks/useErrorDisplay.js`)
   ```javascript
   export const useErrorDisplay = (error, errorInfo) => {
     const [showDetails, setShowDetails] = useState(false);
     const [reportSent, setReportSent] = useState(false);
     const [userMessage, setUserMessage] = useState('');
     
     useEffect(() => {
       if (error) {
         // Determine user-friendly message
         const message = getErrorMessage(error);
         setUserMessage(message);
         
         // Auto-show details in dev
         if (process.env.NODE_ENV === 'development') {
           setShowDetails(true);
         }
       }
     }, [error]);
     
     const sendReport = useCallback(async () => {
       try {
         await sendErrorReport({
           error: error?.toString(),
           stack: error?.stack,
           componentStack: errorInfo?.componentStack,
           userAgent: navigator.userAgent,
           timestamp: new Date().toISOString()
         });
         setReportSent(true);
         showToast('Error report sent. Thank you!', 'success');
       } catch (err) {
         showToast('Failed to send report', 'error');
       }
     }, [error, errorInfo]);
     
     const toggleDetails = useCallback(() => {
       setShowDetails(prev => !prev);
     }, []);
     
     return {
       userMessage,
       showDetails,
       reportSent,
       sendReport,
       toggleDetails
     };
   };
   ```

### Phase 2: Create Functional Error UI Components

1. **Error Fallback Component** (`src/components/ErrorBoundary/ErrorFallback.js`)
   ```javascript
   export const ErrorFallback = ({ 
     error, 
     errorInfo, 
     resetError,
     errorCount 
   }) => {
     const {
       userMessage,
       showDetails,
       reportSent,
       sendReport,
       toggleDetails
     } = useErrorDisplay(error, errorInfo);
     
     const theme = useTheme();
     const isMobile = useMediaQuery('(max-width: 768px)');
     
     return (
       <Container theme={theme}>
         <ErrorIcon>
           <ExclamationTriangleIcon size={64} />
         </ErrorIcon>
         
         <Title>Oops! Something went wrong</Title>
         
         <Message>{userMessage}</Message>
         
         {errorCount > 2 && (
           <WarningBox>
             Multiple errors detected. The app may be unstable.
           </WarningBox>
         )}
         
         <ActionButtons>
           <Button
             onClick={resetError}
             variant="contained"
             color="primary"
             size={isMobile ? 'small' : 'medium'}
           >
             Try Again
           </Button>
           
           {errorCount > 1 && (
             <Button
               onClick={() => window.location.reload()}
               variant="outlined"
               color="secondary"
             >
               Reload App
             </Button>
           )}
           
           <Button
             onClick={toggleDetails}
             variant="text"
             size="small"
           >
             {showDetails ? 'Hide' : 'Show'} Details
           </Button>
         </ActionButtons>
         
         {showDetails && (
           <ErrorDetails>
             <DetailSection>
               <DetailTitle>Error Message:</DetailTitle>
               <Code>{error?.message || 'Unknown error'}</Code>
             </DetailSection>
             
             {error?.stack && (
               <DetailSection>
                 <DetailTitle>Stack Trace:</DetailTitle>
                 <StackTrace>{error.stack}</StackTrace>
               </DetailSection>
             )}
             
             {errorInfo?.componentStack && (
               <DetailSection>
                 <DetailTitle>Component Stack:</DetailTitle>
                 <StackTrace>{errorInfo.componentStack}</StackTrace>
               </DetailSection>
             )}
           </ErrorDetails>
         )}
         
         {!reportSent && (
           <ReportSection>
             <Button
               onClick={sendReport}
               variant="text"
               size="small"
               startIcon={<SendIcon />}
             >
               Send Error Report
             </Button>
             <HelpText>
               Help us improve by reporting this error
             </HelpText>
           </ReportSection>
         )}
         
         {reportSent && (
           <SuccessMessage>
             ✓ Error report sent successfully
           </SuccessMessage>
         )}
       </Container>
     );
   };
   ```

2. **Error Recovery Component** (`src/components/ErrorBoundary/ErrorRecovery.js`)
   ```javascript
   export const ErrorRecovery = ({ 
     error, 
     onRecover, 
     isRecovering 
   }) => {
     const [recoveryOption, setRecoveryOption] = useState(null);
     
     const recoveryOptions = useMemo(() => {
       const options = [];
       
       if (error?.code === 'STORAGE_ERROR') {
         options.push({
           id: 'clear-storage',
           label: 'Clear Local Storage',
           description: 'Remove all local data and start fresh',
           action: clearLocalStorage
         });
       }
       
       if (error?.code === 'SYNC_ERROR') {
         options.push({
           id: 'disable-sync',
           label: 'Disable Sync',
           description: 'Continue using app offline',
           action: disableSync
         });
       }
       
       options.push({
         id: 'reset-app',
         label: 'Reset App',
         description: 'Clear all data and settings',
         action: resetApplication
       });
       
       return options;
     }, [error]);
     
     const handleRecover = async () => {
       if (recoveryOption) {
         await onRecover(recoveryOption.action);
       }
     };
     
     if (isRecovering) {
       return (
         <RecoveryContainer>
           <Spinner />
           <Text>Attempting recovery...</Text>
         </RecoveryContainer>
       );
     }
     
     return (
       <RecoveryContainer>
         <Title>Recovery Options</Title>
         
         <OptionsList>
           {recoveryOptions.map(option => (
             <RecoveryOption
               key={option.id}
               selected={recoveryOption?.id === option.id}
               onClick={() => setRecoveryOption(option)}
             >
               <OptionTitle>{option.label}</OptionTitle>
               <OptionDesc>{option.description}</OptionDesc>
             </RecoveryOption>
           ))}
         </OptionsList>
         
         <Button
           onClick={handleRecover}
           disabled={!recoveryOption}
           variant="contained"
           color="warning"
         >
           Perform Recovery
         </Button>
       </RecoveryContainer>
     );
   };
   ```

### Phase 3: Minimal Class Wrapper

1. **Modernized Error Boundary** (`src/components/ErrorBoundary/ErrorBoundary.js`)
   ```javascript
   // Minimal class component wrapper (required until React 19)
   class ErrorBoundaryClass extends Component {
     constructor(props) {
       super(props);
       this.state = {
         hasError: false,
         error: null,
         errorInfo: null
       };
     }
     
     static getDerivedStateFromError(error) {
       return { hasError: true, error };
     }
     
     componentDidCatch(error, errorInfo) {
       // Delegate to callback
       this.props.onError?.(error, errorInfo);
       
       // Update state
       this.setState({ errorInfo });
     }
     
     resetError = () => {
       this.setState({
         hasError: false,
         error: null,
         errorInfo: null
       });
     };
     
     render() {
       if (this.state.hasError) {
         return this.props.fallback({
           error: this.state.error,
           errorInfo: this.state.errorInfo,
           resetError: this.resetError
         });
       }
       
       return this.props.children;
     }
   }
   
   // Functional wrapper with hooks
   export const ErrorBoundary = ({ children, FallbackComponent }) => {
     const errorHandler = useErrorHandler();
     
     const handleError = useCallback((error, errorInfo) => {
       errorHandler.logError(error, errorInfo);
     }, [errorHandler]);
     
     const fallback = useCallback(({ error, errorInfo, resetError }) => {
       return (
         <FallbackComponent
           error={error}
           errorInfo={errorInfo}
           resetError={() => {
             resetError();
             errorHandler.resetError();
           }}
           errorCount={errorHandler.errorCount}
           onRecover={errorHandler.recoverError}
           isRecovering={errorHandler.isRecovering}
         />
       );
     }, [FallbackComponent, errorHandler]);
     
     return (
       <ErrorBoundaryClass
         onError={handleError}
         fallback={fallback}
       >
         {children}
       </ErrorBoundaryClass>
     );
   };
   
   // Default export with fallback
   export default function ErrorBoundaryWithFallback({ children }) {
     return (
       <ErrorBoundary FallbackComponent={ErrorFallback}>
         {children}
       </ErrorBoundary>
     );
   }
   ```

### Phase 4: React 19 Preparation

1. **Future Hook Implementation** (`src/components/ErrorBoundary/ErrorBoundary.future.js`)
   ```javascript
   // This will work when React 19 is released
   // Keep as reference for migration
   
   import { useErrorBoundary } from 'react'; // React 19+
   
   export const ErrorBoundary = ({ children, FallbackComponent }) => {
     const [error, resetError] = useErrorBoundary();
     const errorHandler = useErrorHandler();
     
     useEffect(() => {
       if (error) {
         errorHandler.logError(error);
       }
     }, [error, errorHandler]);
     
     if (error) {
       return (
         <FallbackComponent
           error={error}
           resetError={() => {
             resetError();
             errorHandler.resetError();
           }}
           {...errorHandler}
         />
       );
     }
     
     return children;
   };
   ```

## Testing Requirements

### Unit Tests
```javascript
describe('ErrorBoundary', () => {
  test('catches errors in child components');
  test('displays fallback UI on error');
  test('resets error state on retry');
  test('logs errors correctly');
  test('sends error reports');
  test('shows error details in dev mode');
  test('handles multiple consecutive errors');
  test('performs recovery actions');
});
```

### Integration Tests
```javascript
describe('Error Recovery', () => {
  test('recovers from storage errors');
  test('recovers from sync errors');
  test('handles recovery failure');
  test('maintains data integrity during recovery');
});
```

## Acceptance Criteria

1. **Functionality Preserved**
   - Error boundary catches all child errors
   - Displays user-friendly error messages
   - Provides recovery options
   - Logs errors for debugging

2. **Modern Patterns**
   - Logic extracted to hooks
   - UI in functional components
   - Minimal class wrapper
   - TypeScript ready (but not required)

3. **Enhanced Features**
   - Better error messages
   - Recovery options
   - Error reporting
   - Development mode helpers

4. **Performance**
   - No performance regression
   - Fast error recovery
   - Minimal re-renders

## Migration Path

1. **Phase 1** (Current React 18)
   - Implement hybrid approach
   - Keep minimal class wrapper
   - Extract logic to hooks

2. **Phase 2** (React 19 Release)
   - Switch to useErrorBoundary hook
   - Remove class component
   - Full functional implementation

## Success Metrics

- Zero class components (except minimal wrapper)
- Improved error recovery rate
- Better error reporting
- Easier testing and maintenance
- Ready for React 19

## Documentation Updates

1. Update component documentation
2. Add error handling guide
3. Document recovery strategies
4. Update testing guidelines
5. Add migration notes for React 19

## Estimated Effort

- Hook extraction: 4 hours
- UI components: 1 day
- Testing: 4 hours
- Documentation: 2 hours

**Total: 2-3 days**

## Notes

- Keep class wrapper minimal until React 19
- Focus on extracting logic to hooks
- Enhance user experience with better errors
- Prepare for seamless React 19 migration
- Consider adding error analytics

---

*Created: 2025-01-11*
*Story Type: Tech Debt - Modernization*
*Priority: Medium (improves maintainability)*