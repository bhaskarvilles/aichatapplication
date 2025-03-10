import { useAuth0 } from '@auth0/auth0-react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';
import Layout from './components/layout/Layout';
import ChatInterface from './components/chat/ChatInterface';
import { Box, CircularProgress, Typography } from '@mui/material';

// Import Roboto font
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        {isAuthenticated ? (
          <ChatInterface />
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={6}
            gap={2}
          >
            <Typography variant="h2" component="h1" gutterBottom>
              Welcome to Kerdos AI Chat
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please log in to start chatting.
            </Typography>
          </Box>
        )}
      </Layout>
    </ThemeProvider>
  );
}

export default App;
