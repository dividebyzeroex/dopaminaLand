# Dopamina

Comparador de preços com histórico, metodologia pública e alertas por notificação.
Site: https://www.dopaminado.com.br — projeto Vercel `dopamina-land`.

## Aplicações

- `dopamina-brasil`: site principal (Next.js), APIs e PWA.
- `dopamina-insights`: painel administrativo; consultas privadas são feitas no servidor.
- `dopamina-mobile`: aplicativo Expo legado; não é o PWA publicado na Vercel.
- `dopamina-extension`: extensão; `agency-site` e `landsite`: sites separados.

## Desenvolvimento

Node.js 24. Em `dopamina-brasil`: `npm ci`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.
Em `dopamina-insights`: `npm ci`, `npm test`, `npm run typecheck`, `npm run build`.
Configure `.env.local` a partir de `.env.example` em cada aplicativo. Nunca versionar segredos.

O site lê preços públicos do Buscapé. Campos indisponíveis não são inventados.
Histórico próprio e push exigem configuração do banco; cache de produto: 3 horas; checagem de push: 1 hora.
Os links atuais não garantem comissão de afiliado.

## Operação e segurança

Veja [operação](docs/operations.md) para configuração, ordem das migrations, validação e limitações.
A CI valida o código sem credenciais de produção. A integração Git da Vercel continua responsável pelos deployments.
