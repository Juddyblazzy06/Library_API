import healthRoutes from './routes/healthRoutes'

// Health check route
app.use('/api', healthRoutes)

// ... rest of your routes and middleware ...
