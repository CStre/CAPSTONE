# Lambda container image for the GraphQL backend.
# Built and pushed to ECR by the CI/CD pipeline; deployed by Terraform.

# --- build stage: install deps and bundle with esbuild ---
FROM public.ecr.aws/lambda/nodejs:24 AS build
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npx esbuild src/handler.ts \
    --bundle --platform=node --target=node24 \
    --outfile=dist/handler.js

# --- runtime stage: minimal Lambda image with just the bundle ---
FROM public.ecr.aws/lambda/nodejs:24
COPY --from=build /build/dist/handler.js ${LAMBDA_TASK_ROOT}/handler.js
CMD ["handler.handler"]
