FROM chatwoot/chatwoot:latest

WORKDIR /app

# Set build environment variables
ENV RAILS_ENV=production
ENV NODE_ENV=production
ENV RAILS_SERVE_STATIC_FILES=true
ENV BUNDLE_PATH="/gems"
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy modified application files
COPY . /app

# Install frontend dependencies and compile modified assets
RUN pnpm install --frozen-lockfile && \
    SECRET_KEY_BASE=precompile_placeholder RAILS_LOG_TO_STDOUT=enabled bundle exec rake assets:precompile && \
    rm -rf spec node_modules tmp/cache

RUN chmod -R +x /app/docker/entrypoints

EXPOSE 3000

ENTRYPOINT ["docker/entrypoints/rails.sh"]
CMD ["sh", "-c", "bundle exec rails db:chatwoot_prepare && bundle exec sidekiq -C config/sidekiq.yml & bundle exec rails s -p 3000 -b 0.0.0.0"]
