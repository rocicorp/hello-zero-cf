-- Create tables matching Zero schema (User + Message only, no Medium)

CREATE TABLE "user" (
  "id" VARCHAR PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "partner" BOOLEAN NOT NULL
);

CREATE TABLE "message" (
  "id" VARCHAR PRIMARY KEY,
  "sender_id" VARCHAR REFERENCES "user"(id),
  "body" VARCHAR NOT NULL,
  "timestamp" BIGINT NOT NULL
);

-- Seed users (matching hello-zero-do data)
INSERT INTO "user" (id, name, partner) VALUES
('ycD76wW4R2', 'Aaron', true),
('IoQSaxeVO5', 'Matt', true),
('WndZWmGkO4', 'Cesar', true),
('ENzoNm7g4E', 'Erik', true),
('dLKecN3ntd', 'Greg', true),
('enVvyDlBul', 'Darick', true),
('9ogaDuDNFx', 'Alex', true),
('6z7dkeVLNm', 'Dax', false),
('7VoEoJWEwn', 'Nate', false);
