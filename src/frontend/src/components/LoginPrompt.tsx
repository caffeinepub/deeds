import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Sparkles } from 'lucide-react';
import StarEffectLogo from './StarEffectLogo';

export default function LoginPrompt() {
  const { login, loginStatus } = useInternetIdentity();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white relative">
      {isLoggingIn && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] animate-fade-in"
          aria-hidden="true"
        />
      )}
      
      <Card className={`w-full max-w-md shadow-2xl border-border/50 bg-white transition-all duration-300 ${isLoggingIn ? 'relative z-[160] scale-[1.02]' : 'relative z-10'}`}>
        <CardHeader className="text-center space-y-6 pb-6">
          <div className="flex items-center justify-center mb-2">
            <StarEffectLogo
              src="/assets/generated/updated-deeds-logo-white-glow-d-star-effect.dim_400x120.png"
              alt="Deeds"
              className="h-32 w-auto"
            />
          </div>
          <div className="space-y-3">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              Welcome to Deeds
            </CardTitle>
            <CardDescription className="text-lg font-medium text-muted-foreground px-4">
              Connect. Share. Inspire.
            </CardDescription>
            <p className="text-sm text-muted-foreground px-4 leading-relaxed">
              Join our community of changemakers spreading kindness and positivity
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-500/10 to-red-400/10 rounded-xl border border-red-500/20 transition-all hover:border-red-500/30 hover:shadow-md">
              <Sparkles className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm mb-1">Share Good Deeds</h3>
                <p className="text-xs text-muted-foreground">
                  Post your positive actions and inspire others
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-400/10 to-red-600/10 rounded-xl border border-red-400/20 transition-all hover:border-red-400/30 hover:shadow-md">
              <Sparkles className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm mb-1">Join Challenges</h3>
                <p className="text-xs text-muted-foreground">
                  Participate in weekly themed positive engagement
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-600/10 to-red-500/10 rounded-xl border border-red-600/20 transition-all hover:border-red-600/30 hover:shadow-md">
              <Sparkles className="h-5 w-5 text-red-700 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm mb-1">Connect & Inspire</h3>
                <p className="text-xs text-muted-foreground">
                  Build a community of kindness together
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
          >
            {isLoggingIn ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                Logging in...
              </>
            ) : (
              'Get Started'
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground px-2">
            By logging in, you agree to spread positivity and kindness
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
