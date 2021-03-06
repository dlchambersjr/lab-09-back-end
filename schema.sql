DROP TABLE weathers, restaurants, movies, meetups, trails, locations;

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude NUMERIC(8,6),
  longitude NUMERIC(9,6)
);

CREATE TABLE IF NOT EXISTS weathers (
  id SERIAL PRIMARY KEY,
  forecast VARCHAR(255),
  time VARCHAR(255),
  created_at BIGINT,
  location_id INTEGER NOT NULL REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  image_url VARCHAR(255),
  price VARCHAR(255),
  rating NUMERIC(4,2),
  url VARCHAR(255),
  created_at BIGINT,
  location_id INTEGER NOT NULL REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  overview VARCHAR(255),
  average_votes NUMERIC(4,2),
  total_votes BIGINT,
  image_url VARCHAR(255),
  popularity NUMERIC(5,3),
  released_on VARCHAR(255),
  created_at BIGINT,
  location_id INTEGER NOT NULL REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS meetups (
  id SERIAL PRIMARY KEY, 
  name VARCHAR(255),
  link VARCHAR(255),
  host VARCHAR(255),
  creation_date VARCHAR(255),
  created_at BIGINT,
  location_id INTEGER NOT NULL REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS trails (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  trail_url VARCHAR(255),
  location VARCHAR(255),
  length NUMERIC(3,1),
  condition_date VARCHAR(255),
  condition_time VARCHAR(255),
  conditions VARCHAR(255),
  stars NUMERIC(3,1),
  star_votes VARCHAR(255),
  summary VARCHAR(255),
  created_at BIGINT,
  location_id INTEGER NOT NULL REFERENCES locations(id)
);

