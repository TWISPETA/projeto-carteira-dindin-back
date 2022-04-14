DROP TABLE IF EXISTS usuarios, categorias, transacoes;

CREATE TABLE usuarios (
  id serial NOT NULL PRIMARY KEY,
  nome text NOT NULL,
  email text NOT NULL,
  senha text NOT NULL
);

CREATE TABLE categorias(
  id serial NOT NULL PRIMARY KEY, 
  descricao text NULL
);

CREATE TABLE transacoes(
  id serial NOT NULL PRIMARY KEY,
  descricao text NULL,
  valor integer NOT NULL,
  data timestamp NOT NULL,
  categoria_id int NOT NULL REFERENCES categorias(id),
  usuario_id int NOT NULL REFERENCES usuarios(id),
  tipo varchar NOT NULL
);

INSERT INTO categorias(descricao) 
VALUES 
('Alimentação'),
('Assinaturas e Serviços'),
('Casa'),
('Mercado'),
('Cuidados Pessoais'),
('Educação'),
('Familia'),
('Lazer'),
('Pets'),
('Presentes'),
('Roupas'),
('Saúde'),
('Transporte'),
('Salário'),
('Vendas'),
('Outras Receitas'),
('Outras Despesas')









