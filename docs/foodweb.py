#| standalone: true
from shiny import *
from shinywidgets import output_widget, render_widget, register_widget
import numpy as np
import networkx as nx
import csv
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from pathlib import Path 
import pyodide


app_ui = ui.page_fluid({"style": "background-color: #243447;"},
    ui.div(
        {"style": "height: 1000px; background-color: #243447;"},
        output_widget("fig")
    )
)

def server(input, output, session):
    # @output
    # @render.text
    # @render_widget

    
    
    # Load the adjacency matrix from a CSV file
    matrix = pd.read_csv(pyodide.http.open_url("https://raw.githubusercontent.com/wildliferesilience/wildliferesilience/main/docs/input/MetaNetwork_Matrix_LTB_June.csv"), header=None).values

    # Load the node names from a CSV file with the specified column names
    names = pd.read_csv(pyodide.http.open_url("https://raw.githubusercontent.com/wildliferesilience/wildliferesilience/main/docs/input/MetaNetwork_Matrix_Label_LTB_June.csv"), usecols=["id", "guild", "G", "taxon"])
    node_names = names.apply(lambda row: f"{row['id']} ({row['guild']}, {row['G']}, {row['taxon']})", axis=1).tolist()

    # Create a graph from the adjacency matrix
    G = nx.from_numpy_matrix(matrix)
    G = nx.relabel_nodes(G, dict(zip(range(len(G.nodes())), node_names)))
    G = nx.DiGraph(G)

    # Manually specify the position of each node
    pos = nx.spring_layout(G)

    # Add the 'pos' attribute to each node
    for node in G.nodes():
        G.nodes[node]['pos'] = pos[node]

    # Create a Plotly figure
    fig = go.FigureWidget()

    # Define a color scale for the nodes based on the values in the 'taxon' column of the node names CSV file
    taxons = names['taxon'].unique()

    color_scale = dict(zip(taxons, px.colors.qualitative.Plotly))

    # Add the edges to the figure
    for edge in G.edges():
        x0, y0 = G.nodes[edge[0]]['pos']
        x1, y1 = G.nodes[edge[1]]['pos']
        fig.add_trace(go.Scatter(x=[x0, x1], y=[y0, y1], mode='lines', line=dict(width=0.5, color='#888'), hoverinfo='none'))

    # Add the nodes to the figure
    for node in G.nodes():
        x, y = G.nodes[node]['pos']
        label = names.loc[names['id'] == int(node.split()[0]), 'taxon'].values[0]
        color = color_scale.get(label, 'gray')  # Use 'gray' as the default color if the label is not in the color_scale dictionary
        fig.add_trace(go.Scatter(x=[x], y=[y], mode='markers', marker=dict(size=5, color=color), hoverinfo='text', text=node))

    # Set the layout of the figure
    fig.update_layout(title='Meta Network of Sierra', showlegend=False, hovermode='closest', margin=dict(b=20, l=5, r=5, t=40))

    fig.update_layout(
        autosize=True,
        height=1000,
        paper_bgcolor="#243447",
        font_color="white"
    )

    register_widget("fig", fig)


app = App(app_ui, server)

