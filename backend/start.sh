#!/bin/bash
echo "Starting CareerVault API..."
echo
echo "Installing requirements..."
pip install -r requirements_simple.txt
echo
echo "Starting server..."
python simple_main.py
