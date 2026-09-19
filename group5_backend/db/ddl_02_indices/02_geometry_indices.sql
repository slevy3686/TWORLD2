create index idx_vertex_owner on vertices(vertex_ID, vertex_owner_type, vertex_owner_ID);
create index idx_vertex_type on vertices(vertex_ID, vertex_type);
create index idx_vertex_coordinates on vertices(vertex_ID, x_coordinate, y_coordinate);
