drop table fotocamera_brand;
create table if not exists `fotocamera_brand` (
	`id` int unsigned not null auto_increment,
	`codice` varchar(100) not null,
	`nome` varchar(100) not null,
	`abilitato` tinyint(1) unsigned not null default 0,
	`per_fotocamera` tinyint(1) unsigned not null default 0,
	`per_obiettivo` tinyint(1) unsigned not null default 0,
	index `codice`(`codice`),
	index `abilitato`(`abilitato`),
	index `per_fotocamera`(`per_fotocamera`),
	index `per_obiettivo`(`per_obiettivo`),
	primary key  (`id`)
) engine=innodb default charset=utf8 auto_increment=1;

drop table fotocamera_modello;
create table if not exists `fotocamera_modello` (
	`id` int unsigned not null auto_increment,
	`brand_id` int unsigned not null,
	`codice` varchar(100) not null,
	`nome` varchar(100) not null,
	`mount_lens` varchar(100) null,
	`leo3_wi_dic_mm` int unsigned not null default 0,
	`leo3_wi_plus_dic_mm` int unsigned not null default 0,
	`leo3_dic_mm` int unsigned not null default 0,
	`leo3_plus_dic_mm` int unsigned not null default 0,
	`leor_dic_mm` int unsigned not null default 0,
	`abilitato` tinyint(1) unsigned not null default 0,
	index `codice`(`codice`),
	index `abilitato`(`abilitato`),
	index `brand_id`(`brand_id`),
	index `leo3_wi_dic_mm`(`leo3_wi_dic_mm`),
	index `leo3_wi_plus_dic_mm`(`leo3_wi_plus_dic_mm`),
	index `leo3_dic_mm`(`leo3_dic_mm`),
	index `leo3_plus_dic_mm`(`leo3_plus_dic_mm`),
	index `leor_dic_mm`(`leor_dic_mm`),
	primary key  (`id`)
) engine=innodb default charset=utf8 auto_increment=1;

drop table fotocamera_obiettivo;
create table if not exists `fotocamera_obiettivo` (
	`id` int unsigned not null auto_increment,
	`brand_id` int unsigned not null,
	`codice` varchar(100) not null,
	`nome` varchar(100) not null,
	`mount_lens` varchar(25) not null,
	`angle_min` int unsigned not null default 0,
	`angle_max` int unsigned not null default 0,
	`ring` int unsigned not null default 0,
	`length_mm` int unsigned not null default 0,
	`diameter_mm` int unsigned not null default 0,
	`abilitato` tinyint(1) unsigned not null default 0,
	index `mount_lens`(`mount_lens`),
	index `codice`(`codice`),
	index `brand_id`(`brand_id`),
	index `abilitato`(`abilitato`),
	primary key  (`id`)
) engine=innodb default charset=utf8 auto_increment=1;

