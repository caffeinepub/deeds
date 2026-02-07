import { useState, useEffect } from 'react';

export interface WeatherData {
  condition: 'sunny' | 'rainy' | 'snowy' | 'cloudy' | 'clear';
  temperature: number;
  city: string;
  isDay: boolean;
}

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  isDay: boolean;
}

// Free weather API - OpenMeteo (no API key required)
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [sunTimes, setSunTimes] = useState<SunTimes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchWeather = async () => {
      try {
        // Get user's location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            maximumAge: 600000, // Cache for 10 minutes
          });
        });

        const { latitude, longitude } = position.coords;

        // Fetch weather data
        const response = await fetch(
          `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&daily=sunrise,sunset&timezone=auto`
        );

        if (!response.ok) throw new Error('Weather API error');

        const data = await response.json();

        if (!mounted) return;

        // Map weather codes to conditions
        const weatherCode = data.current.weather_code;
        let condition: WeatherData['condition'] = 'clear';
        
        if (weatherCode === 0) condition = data.current.is_day ? 'sunny' : 'clear';
        else if (weatherCode >= 1 && weatherCode <= 3) condition = 'cloudy';
        else if (weatherCode >= 51 && weatherCode <= 67) condition = 'rainy';
        else if (weatherCode >= 71 && weatherCode <= 77) condition = 'snowy';
        else if (weatherCode >= 80 && weatherCode <= 99) condition = 'rainy';

        const sunrise = new Date(data.daily.sunrise[0]);
        const sunset = new Date(data.daily.sunset[0]);
        const now = new Date();
        const isDay = now >= sunrise && now <= sunset;

        setWeather({
          condition,
          temperature: Math.round(data.current.temperature_2m),
          city: 'Your Location',
          isDay,
        });

        setSunTimes({
          sunrise,
          sunset,
          isDay,
        });

        setError(null);
      } catch (err) {
        if (!mounted) return;
        console.error('Weather fetch error:', err);
        
        // Fallback to time-based day/night cycle
        const now = new Date();
        const hour = now.getHours();
        const isDay = hour >= 6 && hour < 20;
        
        setWeather({
          condition: isDay ? 'sunny' : 'clear',
          temperature: 20,
          city: 'Unknown',
          isDay,
        });

        const today = new Date();
        today.setHours(6, 0, 0, 0);
        const sunrise = new Date(today);
        today.setHours(20, 0, 0, 0);
        const sunset = new Date(today);

        setSunTimes({
          sunrise,
          sunset,
          isDay,
        });

        setError('Using default weather');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWeather();

    // Update every 10 minutes
    const intervalId = setInterval(fetchWeather, 600000);

    // Update day/night status every minute
    const dayNightInterval = setInterval(() => {
      if (sunTimes) {
        const now = new Date();
        const isDay = now >= sunTimes.sunrise && now <= sunTimes.sunset;
        setSunTimes(prev => prev ? { ...prev, isDay } : null);
        setWeather(prev => prev ? { ...prev, isDay } : null);
      }
    }, 60000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
      clearInterval(dayNightInterval);
    };
  }, []);

  return { weather, sunTimes, isLoading, error };
}
