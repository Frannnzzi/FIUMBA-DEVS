CREATE TABLE public.usuarios (
	id_usuario serial4 NOT NULL,
	nombre varchar(25) NOT NULL,
	apellido varchar(50) NOT NULL,
	rol varchar(30) NOT NULL,
	avatar int4 NOT NULL,
	mail varchar(70) NOT NULL,
	CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario)
);

CREATE TABLE public.proyectos (
	id_proyecto serial4 NOT NULL,
	nombre varchar(25) NOT NULL,
	fecha_inicio date NOT NULL,
	fecha_final date NOT NULL,
	estado varchar(30) NOT NULL,
	descripcion varchar(100) NULL,
	id_usuario int4 NOT NULL,
	CONSTRAINT proyectos_pkey PRIMARY KEY (id_proyecto),
	CONSTRAINT proyectos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario)
);

CREATE TABLE public.tareas (
	id_tarea serial4 NOT NULL,
	titulo varchar(30) NOT NULL,
	estado varchar(30) NOT NULL,
	descripcion varchar(100) NULL,
	fecha_final date NOT NULL,
	prioridad varchar(20) NOT NULL,
	id_proyecto int4 NOT NULL,
	id_usuario int4 NOT NULL,
	CONSTRAINT tareas_pkey PRIMARY KEY (id_tarea),
	CONSTRAINT tareas_id_proyecto_fkey FOREIGN KEY (id_proyecto) REFERENCES public.proyectos(id_proyecto),
	CONSTRAINT tareas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario)
);

CREATE TABLE public.usuarios_proyectos (
	id_usuario int4 NOT NULL,
	id_proyecto int4 NOT NULL,
	CONSTRAINT usuarios_proyectos_pkey PRIMARY KEY (id_usuario, id_proyecto),
	CONSTRAINT usuarios_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE,
	CONSTRAINT proyectos_id_proyecto_fkey FOREIGN KEY (id_proyecto) REFERENCES public.proyectos(id_proyecto) ON DELETE CASCADE,
);