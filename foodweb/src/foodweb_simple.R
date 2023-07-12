library(tidyverse)
library(data.table)
library(igraph)
library(visNetwork)

web <- fread("MetaNetwork_List_LTB_June.csv", header = T)

condensed_web <- web %>% 
  mutate(combination = paste(Source_guild, Target_guild, sep = '__')) %>% 
  group_by(combination) %>% 
  summarize(Source_guild, Target_guild, number = n())

matrix_names <- fread('MetaNetwork_Matrix_Label_LTB_June.csv')

matrix_web <- fread('MetaNetwork_Matrix_LTB_June.csv') %>% as.matrix()

# rownames(matrix_web) <- matrix_names$guild
# colnames(matrix_web) <- matrix_names$guild

g <- graph.adjacency(matrix_web, mode = 'directed')

layout <- layout_as_tree(g)

plot.igraph(g, layout = layout, edge.arrow.size = 0.2)

tkplot(g, layout = layout)

web <- left_join(web, matrix_names, by = c('Source_guild'='guild'))

nodes <- data.frame(id = unique(web$Source_guild), group = unique(web$taxon))
edges <- data.frame(from = web$Source_guild, to = web$Target_guild)

visNetwork(nodes, edges) %>% visPhysics(enabled = F) %>% 
  visEdges(arrows = 'from') %>% 
  visLayout()
