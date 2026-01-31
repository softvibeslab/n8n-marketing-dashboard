    
  POSTGRES_USER=n8n_user                                                                                                              
  POSTGRES_PASSWORD=PEGAR_AQUI_POSTGRES_PASSWORD                                                                                      
  POSTGRES_DB=n8n_marketing_dashboard                                                                                                 
                                                                                                                                      
  # ===========================================                                                                                       
  # Redis                                                                                                                             
  # ===========================================                                                                                       
  REDIS_PASSWORD=PEGAR_AQUI_REDIS_PASSWORD                                                                                            
                                                                                                                                      
  # ===========================================                                                                                       
  # JWT Authentication                                                                                                                
  # ===========================================                                                                                       
  JWT_SECRET=PEGAR_AQUI_JWT_SECRET                                                                                                    
  JWT_ACCESS_EXPIRATION=15m                                                                                                           
  JWT_REFRESH_EXPIRATION=7d                                                                                                           
                                                                                                                                      
  # ===========================================                                                                                       
  # n8n Integration                                                                                                                   
  # ===========================================                                                                                       
  N8N_BASIC_AUTH_ACTIVE=true                                                                                                          
  N8N_BASIC_AUTH_USER=admin                                                                                                           
  N8N_BASIC_AUTH_PASSWORD=PEGAR_AQUI_N8N_PASSWORD                                                                                     
  N8N_ENCRYPTION_KEY=PEGAR_AQUI_ENCRYPTION_KEY                                                                                        
  N8N_HOST=n8n.tudominio.com                                                                                                          
  N8N_PORT=5678                                                                                                                       
  N8N_PROTOCOL=http                                                                                                                   
  WEBHOOK_URL=http://n8n.tudominio.com/                                                                                               
                                                                                                                                      
  # ===========================================                                                                                       
  # AI Services (opcional pero recomendado)                                                                                           
  # ===========================================                                                                                       
  OPENAI_API_KEY=sk-tu-api-key-de-openai-aqui                                                                                         
  OPENAI_MODEL=gpt-4-turbo-preview                                                                                                    
  OPENAI_MAX_TOKENS=2000                                                                                                              
                                                                                                                                      
  # ===========================================                                                                                       
  # Frontend                                                                                                                          
  # ===========================================                                                                                       
  VITE_API_URL=http://31.97.145.53:3001/api/v1                                                                                        
  VITE_APP_URL=http://31.97.145.53                                                                                                    
  VITE_APP_NAME=n8n Marketing Dashboard                                                                                               
                                                                                                                                      
  # ===========================================                                                                                       
  # Backend                                                                                                                           
  # ===========================================                                                                                       
  NODE_ENV=production                                                                                                                 
  PORT=3001                                                                                                                           
  CORS_ORIGIN=http://31.97.145.53,https://tudominio.com                                                                               
  LOG_LEVEL=info                                                                                                                      
     