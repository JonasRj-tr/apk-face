# Facebook Auto Post

Aplicativo Android para publicação automática em grupos do Facebook.

## Funcionalidades

- 🔐 Login com Facebook (via token de acesso)
- 👥 Listar todos os grupos que a conta participa
- ✅ Selecionar todos ou alguns grupos
- 📝 Publicar texto
- 🖼️ Publicar imagens
- 🎥 Publicar vídeos
- ⏱️ Definir delay entre publicações
- 🚀 Publicação automática

## IMPORTANTE - Limitações da API do Facebook

O Facebook implementou restrições severas na API para postagem em grupos:

1. **Aprovação Necessária**: O app precisa ser revisado e aprovado pelo Facebook
2. **Permissões Restritas**: A maioria das permissões de grupo foram removidas
3. **Risco de Bloqueio**: Postagens automatizadas podem violar os Termos de Serviço
4. **Alternativa**: Use tokens de acesso de longo prazo obtidos manualmente

## Configuração

### 1. Obter Facebook App ID

1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Crie um novo aplicativo
3. Adicione o produto "Facebook Login"
4. Configure o Facebook Login com OAuth

### 2. Obter Access Token

Devido às restrições da API, você pode:

1. Usar o [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Selecione sua aplicação
3. Adicione a permissão `groups_access_member_info`
4. Clique em "Get Access Token"
5. Use o token na aplicação

### 3. Configurar no Código

Edite `src/services/FacebookService.ts`:

```typescript
const FB_APP_ID = 'SEU_FB_APP_ID';
```

## Como Usar

1. **Login**: Insira seu access token ou use login via Facebook
2. **Selecionar Grupos**: Escolha quais grupos desejam postar
3. **Criar Post**: Adicione texto, imagem ou vídeo
4. **Definir Delay**: Configure o intervalo entre publicações
5. **Publicar**: Inicie a publicação automática

## Executar o App

```bash
# Install dependencies
npm install

# Run on Android
npx expo run:android

# Build APK
npx expo run:android --variant release
```

## Tecnologias

- React Native (Expo)
- TypeScript
- Expo Image Picker
- Async Storage
- React Navigation
