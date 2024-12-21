-- create user
CREATE USER 'cosc203' IDENTIFIED BY 'password';
GRANT ALL ON *.* TO 'cosc203' WITH GRANT OPTION;

-- create database

DROP TABLE IF EXISTS Photos;
DROP TABLE IF EXISTS Bird;
DROP TABLE IF EXISTS ConservationStatus;
DROP DATABASE ASGN2;

CREATE DATABASE ASGN2;
USE ASGN2;

-- create tables
CREATE TABLE ConservationStatus (
    status_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(255) NOT NULL,
    status_colour CHAR(7) NOT NULL
);

create table Bird (
    bird_id int not null auto_increment primary key,
    primary_name varchar(255) not null,
    english_name varchar(255) not null,
    scientific_name varchar(255) not null,
    order_name varchar(255) not null,
    family varchar(255) not null,
    length int not null,
    weight int not null,
    status_id int not null,
    constraint status_id_cnst foreign key (status_id) references ConservationStatus(status_id)
);

create table Photos (
    photo_id int not null auto_increment primary key,
    filename varchar(255) not null,
    photographer varchar(255) not null,
    bird_id int not null,
    constraint bird_id_cnst foreign key (bird_id) references Bird(bird_id)
);

