# check version on https://hub.docker.com/_/php?tab=tags, change only the number, NO fpm base image
FROM php:7.3-apache

# Install PDO extensions
RUN docker-php-ext-install pdo pdo_mysql

# Add the script to install PHP extensions
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

# Install base PHP extensions
RUN chmod +x /usr/local/bin/install-php-extensions && sync && \
    install-php-extensions pdo_mysql mysqli gd mbstring exif ssh2

# Install optional packages and a2enmod rewrite
RUN apt-get update && \
    apt-get install -y joe wkhtmltopdf iputils-ping telnet mycli nano

# pear and Mail packages are removed since they were causing issues
# and are not necessary for the ssh2 installation example provided

# a2enmod rewrite
RUN a2enmod rewrite

# Install zip extension dependencies and the extension itself
RUN apt-get install -y libzip-dev zip && \
    docker-php-ext-install zip

ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2
ENV APACHE_LOCK_DIR /var/lock/apache2
ENV APACHE_PID_FILE /var/run/apache2.pid

EXPOSE 80

COPY virtual-host.conf /etc/apache2/sites-enabled/000-default.conf
RUN chown -R www-data:www-data /var/www