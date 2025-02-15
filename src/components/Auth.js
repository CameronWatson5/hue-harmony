import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { auth } from '../firebase';
import { 
  GoogleAuthProvider, 
  signInWithRedirect,
  getRedirectResult,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail
} from 'firebase/auth';

const Auth = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState('options'); // 'options', 'signup', 'signin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setUser(result.user);
        }
      } catch (error) {
        console.error('Redirect error:', error);
        setError(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    checkRedirectResult();

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'This sign in method is not enabled. Please contact support.';
      case 'auth/weak-password':
        return 'Please choose a stronger password (at least 6 characters).';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password.';
      default:
        return error.message;
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Google auth error:', error);
      setError(getErrorMessage(error));
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setIsLoading(true);

      // Check if email exists
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        setError('This email is already registered. Please sign in instead.');
        setMode('signin');
        setIsLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      try {
        await sendEmailVerification(userCredential.user);
        setEmail('');
        setPassword('');
        setError('Verification email sent! Please check your inbox.');
      } catch (verificationError) {
        console.error('Verification email error:', verificationError);
        setError('Account created, but verification email failed to send. Please try resending verification later.');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Sign in error:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError('Password reset email sent! Please check your inbox.');
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
      setError(null);
      setMode('options');
    } catch (error) {
      console.error('Sign out error:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingMessage>Loading...</LoadingMessage>
      </Container>
    );
  }

  if (user) {
    return (
      <Container>
        <UserSection>
          <UserInfo>
            <Avatar src={user.photoURL || 'https://via.placeholder.com/32'} alt={user.displayName || user.email} />
            <UserDetails>
              <span>{user.displayName || user.email}</span>
              {!user.emailVerified && user.email && (
                <VerificationMessage>
                  Email not verified. 
                  <ResendButton 
                    onClick={async () => {
                      try {
                        await sendEmailVerification(user);
                        setError('Verification email sent! Please check your inbox.');
                      } catch (error) {
                        setError(getErrorMessage(error));
                      }
                    }}
                  >
                    Resend verification
                  </ResendButton>
                </VerificationMessage>
              )}
            </UserDetails>
          </UserInfo>
          <SignOutButton onClick={handleSignOut} disabled={isLoading}>
            Sign Out
          </SignOutButton>
        </UserSection>
      </Container>
    );
  }

  return (
    <Container>
      <StatusMessage error={error?.includes('error') || error?.includes('invalid') || error?.includes('failed')}>
        {error}
      </StatusMessage>
      
      {mode === 'options' && (
        <ButtonGroup>
          <AuthButton onClick={handleGoogleAuth} disabled={isLoading}>
            Sign in with Google
          </AuthButton>
          <AuthButton onClick={() => setMode('signup')} disabled={isLoading}>
            Sign up with Email
          </AuthButton>
          <AuthButton onClick={() => setMode('signin')} disabled={isLoading}>
            Sign in with Email
          </AuthButton>
        </ButtonGroup>
      )}

      {(mode === 'signup' || mode === 'signin') && (
        <Form onSubmit={mode === 'signup' ? handleEmailSignUp : handleEmailSignIn}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <ButtonGroup>
            <AuthButton type="submit" disabled={isLoading}>
              {mode === 'signup' ? 'Sign Up' : 'Sign In'}
            </AuthButton>
            {mode === 'signin' && (
              <TextButton type="button" onClick={handlePasswordReset}>
                Forgot Password?
              </TextButton>
            )}
          </ButtonGroup>
          <ToggleText>
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
            <TextButton 
              type="button" 
              onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            >
              {mode === 'signup' ? 'Sign In' : 'Sign Up'}
            </TextButton>
          </ToggleText>
          <TextButton type="button" onClick={() => setMode('options')}>
            Back to options
          </TextButton>
        </Form>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
  margin-left: auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

const LoadingMessage = styled.div`
  color: #666;
  font-size: 0.875rem;
`;

const StatusMessage = styled.div`
  color: ${props => props.error ? '#f44336' : '#4caf50'};
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  width: 100%;
  text-align: center;
  min-height: 1.25rem;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const VerificationMessage = styled.span`
  font-size: 0.75rem;
  color: #f44336;
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #4285f4;
  padding: 0;
  font-size: 0.75rem;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #357abd;
  }
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;

const AuthButton = styled.button`
  background: #4285f4;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  width: 100%;
  opacity: ${props => props.disabled ? 0.7 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};

  &:hover {
    background: ${props => props.disabled ? '#4285f4' : '#357abd'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
  }

  &:active {
    transform: translateY(0);
  }
`;

const SignOutButton = styled(AuthButton)`
  background: #f44336;

  &:hover {
    background: ${props => props.disabled ? '#f44336' : '#d32f2f'};
  }
`;

const TextButton = styled.button`
  background: none;
  border: none;
  color: #4285f4;
  padding: 0;
  font-size: 0.875rem;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ToggleText = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.875rem;
`;

export default Auth;
