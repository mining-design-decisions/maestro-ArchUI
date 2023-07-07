# Python base image 
FROM python:3.10-slim

# Install requirements 
COPY requirements.txt requirements.txt 
RUN python3.10 -m pip install -r requirements.txt 

# Install NLTK data 
RUN python3.10 -c "import nltk; nltk.download('stopwords')"

# Copy remaining source files 
COPY . . 

# Set startup command 
CMD ["flask", "run", "-h", "0.0.0.0", "-p", "5000"]