FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build \
&& pnpm deploy --filter=@icebreakers/foo --prod /prod/foo \
&& pnpm deploy --filter=@icebreakers/bar --prod /prod/bar

FROM base AS foo
COPY --from=builder /prod/foo /prod/foo
WORKDIR /prod/foo
EXPOSE 8000
CMD [ "pnpm", "start" ]

FROM base AS bar
COPY --from=builder /prod/bar /prod/bar
WORKDIR /prod/bar
EXPOSE 8001
CMD [ "pnpm", "start" ]

# docker build . --target foo --tag foo:latest
# docker build . --target bar --tag bar:latest