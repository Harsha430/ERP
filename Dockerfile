
# COPY THE XML AND SOURCE FILES TO THE CONTAINER
# RUN THE MAVEN COMMAND TO BUILD THE JAR FILE
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests   

# BUILD THE JAR FILE
# COPY THE JAR FILE TO THE RUNNER CONTAINER
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar /app/erp.jar  

# EXPOSE the default port (though Render will override this with $PORT)
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "erp.jar"]
