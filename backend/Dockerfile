# Gunakan image Python resmi
FROM python:3.10

# Set working directory di dalam container
WORKDIR /code

# Copy requirements dulu untuk caching layer
COPY ./requirements.txt /code/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy seluruh kode backend ke container
COPY ./app /code/app

# Buat folder untuk penyimpanan file (uploads & models)
RUN mkdir -p /code/uploads /code/models

# Berikan izin akses folder
RUN chmod -R 777 /code/uploads /code/models

# Jalankan FastAPI menggunakan Uvicorn
# Hugging Face menggunakan port 7860 secara default
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]