FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_APP_BACKENDURI
ARG VITE_APP_FRONTENDURI
ARG VITE_RAZORPAY_KEY_ID

ENV VITE_APP_BACKENDURI=$VITE_APP_BACKENDURI
ENV VITE_APP_FRONTENDURI=$VITE_APP_FRONTENDURI
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID

RUN pnpm build


FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
