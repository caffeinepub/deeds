import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

export default function Space() {
  return (
    <div className="container py-6 pb-24 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Space</h1>
            <p className="text-muted-foreground">Immersive cosmic atmosphere</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Cosmic Atmosphere</CardTitle>
              <CardDescription>
                Experience a relaxing space environment with animated stars and nebula effects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The space theme adapts to day and night modes, creating an immersive atmosphere
                that changes throughout the day.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customization</CardTitle>
              <CardDescription>
                Personalize your space experience with adjustable settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Control star density, nebula intensity, and theme preferences to create your
                perfect cosmic environment.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
