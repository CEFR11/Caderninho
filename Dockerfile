# Backend do Caderninho para hospedagem (Render). O frontend vai separado, na Vercel.

# Etapa 1: compila o .jar com o Maven do próprio projeto (mvnw).
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Baixa as dependências antes de copiar o código: enquanto o pom.xml não mudar,
# o Docker reaproveita essa etapa e o deploy fica mais rápido.
COPY mvnw pom.xml ./
COPY .mvn .mvn
# No git o mvnw está sem permissão de execução (commitado pelo Windows).
RUN chmod +x mvnw && ./mvnw -q dependency:go-offline

COPY src src
RUN ./mvnw -q -DskipTests package && cp target/*.jar app.jar

# Etapa 2: só o Java para rodar (sem Maven nem código-fonte), imagem bem menor.
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/app.jar app.jar

# Não roda como root dentro do container.
RUN useradd --system caderninho
USER caderninho

ENV SPRING_PROFILES_ACTIVE=prod
# O plano grátis do Render tem 512 MB: o Java usa no máximo 75% disso e sobra para o resto.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75"

# O Render avisa a porta pela variável PORT (application-prod.properties lê ela).
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
