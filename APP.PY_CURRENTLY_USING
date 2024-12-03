import cx_Oracle
import os
from flask import Flask, request, jsonify, render_template, send_from_directory
import os
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import cx_Oracle
import threading
from werkzeug.utils import secure_filename
from datetime import datetime
import fitz  # PyMuPDF
import cohere
from langchain_community.vectorstores import Qdrant
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from qdrant_client import QdrantClient
from cohere import ClassifyExample

# Set Oracle environment variables
#os.environ['ORACLE_HOME'] = '/u01/app/oracle/product/19.0.0/dbhome_1'
#os.environ['TNS_ADMIN'] = '/u01/app/oracle/product/19.0.0/dbhome_1/network/admin'

# Cohere API Key
cohere_api_key = os.getenv('COHERE_API_KEY', 'fCPIGCn7FFcmymOzCjUBcCpRKh0S0nh2QLi3PFWy')
co = cohere.Client(cohere_api_key)

app = Flask(__name__, template_folder='templates')
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['UPLOAD_FOLDER'] = './uploads'
app.config['ALLOWED_EXTENSIONS'] = {'pdf'}

# Ensure upload directory exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Initialize the embedding model and lock
model_name = "BAAI/bge-large-en"
model_kwargs = {'device': 'cpu'}
encode_kwargs = {'normalize_embeddings': False}

embeddings = HuggingFaceBgeEmbeddings(
    model_name=model_name,
    model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs
)

url = "http://192.168.1.36:6333"
collection_name = "gpt_db"
client = QdrantClient(url=url, prefer_grpc=False)

lock = threading.Lock()
text_storage = {}
session = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def extract_text_from_pdf(file_path):
    doc = fitz.open(file_path)
    text = ""
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text += page.get_text()
    return text

def generate_response(query, doc_content):
    try:
        response = co.generate(
            model='command-xlarge-nightly',
            prompt=f"User query (in user's language): {query}\nRelevant documents: {doc_content}\n\n  If query in ['hello', 'hi', 'hey'], respond 'Hello! It's nice to meet you. How can I assist you today?'; elif query in ['how are you', 'how r u'], respond 'I'm doing well, thanks for asking!'; elif query in ['what is your name', 'what's your name'], respond 'I don't have a personal name, but you can call me DB Gnie Assistant.'; elif Please provide a helpful response based on the relevant documents, Ensure that the response is in the same language as the user's query; elif the user's query is not addressed within the provided documents and is related to Oracle database, perform an internet search and provide the best possible answer; elif the query is unrelated to Oracle database, respond with: 'Sorry, this question is not related to Oracle database.'",
            max_tokens=500
        )
        return response.generations[0].text.strip()
    except cohere.core.api_error.ApiError as e:
        print(f"An error occurred: {e}")
        return None

def generate_file_id():
    return str(datetime.now().timestamp())

def store_text(file_id, text_content):
    text_storage[file_id] = text_content
    
def TEST():
    dns = 'testapp.gapblue.com:1531/TEST'
    username = 'sys'
    password = 'manager'
    return username, password, dns  

def R26():
    dns = '192.168.1.245:1521/VIS'
    username = 'sys'
    password = 'manager'
    return username, password, dns

def R13():
    dns = '192.168.1.225:1521/VIS'
    username = 'system'
    password = 'manager'
    return username, password, dns

def connect_to_db(username, password, dns):
    try:
        connection = cx_Oracle.connect(username, password, dns, mode=cx_Oracle.SYSDBA)
        print("Connection successful")
        return connection
    except cx_Oracle.DatabaseError as e:
        print(f"Database connection error: {e}")  

def TEST_APP():
    dns = 'testapp.gapblue.com:1531/ebs_TEST'
    username = 'apps'
    password = 'apps'
    return username, password, dns

def R26_APP():
    dns = '192.168.1.245:1521/VIS'
    username = 'apps'
    password = 'apps'
    return username, password, dns

def R13_APP():
    dns = '192.168.1.225:1521/VIS'
    username = 'apps'
    password = 'apps'
    return username, password, dns


def connect_to_app(username, password, dns):
    try:
        connection = cx_Oracle.connect(username, password, dns)
        print("Connection to Application successful")
        return connection
    except cx_Oracle.DatabaseError as e:
        print(f"Application connection error: {e}")
        return None

def get_intent_from_llm(query):
    # Call Cohere API to analyze the query and extract intent
    response = co.classify(
        model='embed-multilingual-v2.0',  # Use the appropriate model
        inputs=[query],
        examples=[
            # Provide examples that map typical queries to intents (at least 2 for each label.)
            ClassifyExample(text='give me the details about workflow mailer status.', label='workflow_mailer_status'),
            ClassifyExample(text='i want the details about workflow mailer status.', label='workflow_mailer_status'),
            ClassifyExample(text='give me the details about concurrent manager process status.', label='concurrent_manager_status'),
            ClassifyExample(text='i want to know the  details about concurrent manager process status.', label='concurrent_manager_status'),
            ClassifyExample(text='give me the details about concurrent manager status.', label='concurrent_manager_status'),
            ClassifyExample(text='I want to know the details about concurrent manager status.', label='concurrent_manager_status'),
            ClassifyExample(text='give me the details about blocking sessions.', label='blocking_sessions'),
            ClassifyExample(text='I want to know about blocking sessions.', label='blocking_sessions'),
            ClassifyExample(text='I want to know about tablespace usage.', label='tablespace_usage'),
            ClassifyExample(text='Can you give me the instance information?', label='instance_information'),
            ClassifyExample(text='Tell me about the database information.', label='database_information'),
            ClassifyExample(text='Add responsibility with username John and responsibility key .', label='add_responsibility'),
            ClassifyExample(text='what is the current tablespace usage.', label='tablespace_usage'),
            ClassifyExample(text='give me the instance information?', label='instance_information'),
            ClassifyExample(text='give me the long running concurrent program information?', label='long_running_concurrent_programs'),
            ClassifyExample(text='Tell me about the long running concurrent program information?', label='long_running_concurrent_programs'),
            ClassifyExample(text='print the database information.', label='database_information'),
            ClassifyExample(text='i would like to add a new responsibility to username alex and responsibility key is admin.', label='add_responsibility')
            # Add more examples as needed
        ]
    )

    
    intent = response.classifications[0].prediction
    return intent
    
@app.route('/')
def index():
    return render_template('index.html')   

@app.route('/connect', methods=['POST'])
def connect():
    data = request.json
    db_type = data.get('db_type')
    
    if db_type == 'R26':
        username, password, dns = R26()
    elif db_type == 'TEST':
        username, password, dns = TEST()
    elif db_type == 'R13':
        username, password, dns = R13()    
    else:
        return jsonify({"error": "Invalid database type"}), 400
    
    # Attempt to connect to the database
    connection = connect_to_db(username, password, dns)
    
    if connection:
        session['db_type'] = db_type  # Store the database type in the session
        return jsonify({"message": f"Connected to {db_type} database successfully"}), 200
    else:
        return jsonify({"error": "Failed to connect to the database"}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        file_id = generate_file_id()
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        text_content = extract_text_from_pdf(file_path)
        store_text(file_id, text_content)
        return jsonify({"file_id": file_id, "filename": filename}), 200
    else:
        return jsonify({"error": "Invalid file type. Allowed file types are .pdf"}), 400 
    
@app.route('/connect_app', methods=['POST'])
def connect_app():
    data = request.json
    app_type = data.get('app_type')
    
    if app_type == 'R26_APP':
        username, password, dns = R26_APP()
    elif app_type == 'TEST_APP':
        username, password, dns = TEST_APP()
    elif app_type == 'R13_APP':
        username, password, dns = R13_APP()    
    else:
        return jsonify({"error": "Invalid application type"}), 400
    
    # Attempt to connect to the database
    try:
        connection_app = connect_to_app(username, password, dns)
        session['app_type'] = app_type  # Store app_type in session
    # Optionally, store connection details if needed
        return jsonify({"message": "Connection to Application successful"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to connect to application: {str(e)}"}), 500
    
    

def execute_query(query, db_type=None, app_type=None):
    # Handle DB connections based on db_type
    if db_type:
        if db_type == 'R26':
            username, password, dns = R26()
        elif db_type == 'TEST':
            username, password, dns = TEST()
        elif db_type == 'R13':
            username, password, dns = R13()
        else:
            return None
        
        connection = connect_to_db(username, password, dns)
        if connection:
            try:
                cursor = connection.cursor()
                print(f"Executing query on {db_type}: {query}")  # Log the query before executing
                cursor.execute(query)
                result = cursor.fetchall()  # Fetch all rows from the query result
                return result
            except cx_Oracle.DatabaseError as e:
                error, = e.args
                print(f"Database query error: {error.message}")
                return None
            finally:
                connection.close()
        else:
            return None

    # Handle App connections based on app_type
    elif app_type:
        if app_type == 'R13_APP':
            username, password, dns = R13_APP()
        elif app_type == 'R26_APP':
            username, password, dns = R26_APP()
        elif app_type == 'TEST_APP':
            username, password, dns = TEST_APP()
        else:
            return None

        connection_app = connect_to_app(username, password, dns)
        if connection_app:
            try:
                cursor = connection_app.cursor()
                print(f"Executing query on {app_type}: {query}")  # Log the query before executing
                if query.lower().startswith('declare'):
                    # Execute PL/SQL code directly
                    cursor.execute(query)
                    connection_app.commit()  # Commit the changes
                    return True
                else:
                    cursor.execute(query)
                    if query.lower().startswith('select'):
                        result = cursor.fetchall()  # Fetch all rows from the query result
                        return result
                    else:
                        connection_app.commit()  # Commit the changes for non-query statements
                        return True
            except cx_Oracle.DatabaseError as e:
                error, = e.args
                print(f"App query error: {error.message}")
                return None
            finally:
                connection_app.close()
        else:
            return None

    else:
        print("Either db_type or app_type must be provided")
        return None
  
    
def get_query_from_file(section_name):
    query = ""
    with open('queries.sql', 'r') as file:
        in_section = False
        for line in file:
            if line.strip().startswith(f"[{section_name}]"):
                in_section = True
            elif in_section and line.strip().startswith("["):
                in_section = False
            elif in_section and line.strip() and not line.strip().startswith("--"):
                query += line.strip() + " "
    fetched_query = query.strip()
    print(f"Fetched query: {fetched_query}")  # Log the fetched query
    return fetched_query

def format_tablespace_html(tablespace_data):
    if not tablespace_data:
        return None
    html_table = "<table border='1'><tr><th>Tablespace Name</th><th>Used (MB)</th><th>Free (MB)</th><th>Total (MB)</th><th>Max Size (MB)</th></tr>"
    for row in tablespace_data:
        html_table += f"<tr><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td></tr>"
    html_table += "</table>"
    return html_table

def format_long_running_programs_html(long_running_data):
    if not long_running_data:
        return None
    html_table = "<table border='1'><tr><th>SID</th><th>Serial#</th><th>Username</th><th>Operation</th><th>Object</th><th>Elapsed Time (s)</th><th>Start Time</th><th>Complete (%)</th></tr>"
    for row in long_running_data:
        html_table += f"<tr><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td>{row[5]}</td><td>{row[6]}</td><td>{row[7]}</td></tr>"
    html_table += "</table>"
    return html_table

def format_concurrent_manager_status_html(concurrent_manager_status_data):
    if not concurrent_manager_status_data:
        return None
    html_table = "<table border='1'><tr><th>CONCURRENT_MANAGER_NAME</th><th>MANAGER_NODE</th><th>STATUS</th></tr>"
    for row in concurrent_manager_status_data:
        html_table += f"<tr><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td></tr>"
    html_table += "</table>"
    return html_table

def format_workflow_mailer_status_html(workflow_mailer_status_data):
    if not workflow_mailer_status_data:
        return None
    html_table = "<table border='1'><tr><th>CONTAINER_NAME</th><th>PROCID</th><th>E</th><th>COMPONENT_NAME</th><th>STARTUP_MODE</th><th>COMPONENT_STATUS</th></tr>"
    for row in workflow_mailer_status_data:
        html_table += f"<tr><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td>{row[5]}</td></tr>"
    html_table += "</table>"
    return html_table

def format_blocking_html(blocking_sessions_data):
    if not blocking_sessions_data:
        return None
    html_table = "<table border='1'><tr><th>Blocking Session</th></tr>"
    for row in blocking_sessions_data:
        html_table += f"<tr><td>{row[0]}</td></tr>"
    html_table += "</table>"
    return html_table

def format_instance_html(instance_data):
    if not instance_data:
        return None
    html_table = "<table border='1'><tr><th>Instance_Name</th><th>Host_name</th><th>Version</th><th>Startup_Time</th><th>Status</th></tr>"
    for row in instance_data:
        html_table += f"<tr><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td></tr>"
    html_table += "</table>"
    return html_table

def format_database_html(database_data):
    if not database_data:
        return None
    html_table = "<table border='1'><tr><th>Name</th><th>Created</th><th>Log_Mode</th><th>Open_Mode</th><th>Role</th></tr>"
    for row in database_data:
        html_table += f"<tr><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td></tr>"
    html_table += "</table>"
    return html_table

def format_userinfo_html(user_data):
    if not user_data:
        return None
    html_table = "<table border='1'><tr><th>User</th></tr>"
    for row in user_data:
        html_table += f"<tr><td>{row[0]}</td></tr>"
    html_table += "</table>"
    return html_table
        
    
def get_query_from_file(section_name):
    query = ""
    with open('queries.sql', 'r') as file:
        in_section = False
        for line in file:
            if line.strip().startswith(f"[{section_name}]"):
                in_section = True
            elif in_section and line.strip().startswith("["):
                in_section = False
            elif in_section and line.strip() and not line.strip().startswith("--"):
                query += line.strip() + " "
    fetched_query = query.strip()
    print(f"Fetched query: {fetched_query}")  # Log the fetched query
    return fetched_query    


@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    query = data.get('query', '').strip()
    file_id = data.get('file_id')
    user_id = data.get('user_id')

    if user_id not in session:
        session[user_id] = {'step': 0}

    step = session[user_id]['step']

    if step == 1:  # Step 1 indicates "Connect to Database"
        if 'tablespace usage' in query.lower():
            sql_query = get_query_from_file('tablespace_usage')
            result = execute_query(sql_query)
            if result:
                html_table = format_tablespace_html(result)
                if not html_table:
                    response = "Failed to format tablespace usage data into HTML"
                else:
                    response = html_table
            else:
                response = "Failed to fetch tablespace usage data"
            return jsonify({"response": response}), 200
        elif 'blocking sessions' in query.lower():
            sql_query=get_query_from_file('blocking_sessions')
            result=execute_query(sql_query)
            if result:
                html_table=format_blocking_html(result)
                if not html_table:
                    response="Failed to format blocking session data into html"
                else:
                    response=html_table
            else:
                response="Failed to fetch blocking session data"
            return jsonify({"respomse": response}), 200 
        elif 'workflow mailer status' in query.lower():
            sql_query=get_query_from_file('workflow_mailer_status')
            result=execute_query(sql_query)
            if result:
                html_table=format_workflow_mailer_status_html(result)
                if not html_table:
                    response="Failed to format workflow mailer data into html"
                else:
                    response=html_table
            else:
                response="Failed to fetch workflow mailer data"
            return jsonify({"respomse": response}), 200 
        elif 'concurrent manager processess' in query.lower():
            sql_query = get_query_from_file('concurrent_manager_status')
            result = execute_query(sql_query)
            if result:
                html_table = format_concurrent_manager_status_html(result)
                if not html_table:
                    response = "Failed to format concurrent manager processess data into HTML"
                else:
                    response = html_table
            else:
                response = "Failed to fetch concurrent manager processess data"
            return jsonify({"response": response}), 200                            
        elif 'long running' in query.lower():
            sql_query=get_query_from_file('long_running_concurrent_programs')
            result=execute_query(sql_query)
            if result:
                html_table=format_long_running_programs_html(result)
                if not html_table:
                    response="Failed to format long running program data into html"  
                else:
                    response="Failed to fetch long running program data"   
                return jsonify({"response": response}), 200                 
        elif 'instance information' in query.lower():
            sql_query = get_query_from_file('instance_information')
            result = execute_query(sql_query)
            if result:
                html_table = format_instance_html(result)
                if not html_table:
                    response = "Failed to format instance information data into HTML"
                else:
                    response = html_table
            else:
                response = "Failed to fetch instance information data"
            return jsonify({"response": response}), 200
        elif 'show user' in query.lower():
            sql_query = get_query_from_file('show_user')
            result = execute_query(sql_query)
            if result:
                html_table= format_userinfo_html(result)
                if not html_table:
                    response = " Failed to format show user data into HTML"
                else:
                    response = html_table
            else:
                response =" Failed to fetch show user data"
            return jsonify({"response": response}), 200       
            
        elif 'database information' in query.lower():
            sql_query = get_query_from_file('database_information')
            result = execute_query(sql_query)
            if result:
                html_table = format_database_html(result)
                if not html_table:
                    response = "Failed to format database information data into HTML"
                else:
                    response = html_table
            else:
                response = "Failed to fetch database information data"
            return jsonify({"response": response}), 200
        else:
            return jsonify({'response': 'Sorry, I cannot find the information you\'re looking for.'}), 404
    else:
        # Handle other cases such as document search, vector search, etc.
        if file_id:
            if file_id in text_storage:
                doc_content = text_storage[file_id]
                generated_response = generate_response(query, doc_content)
            else:
                return jsonify({"error": "File content not found. Please upload the file again."}), 400
        else:
            db = Qdrant(
                client=client,
                embeddings=embeddings,
                collection_name=collection_name
            )

            with lock:
                docs = db.similarity_search_with_score(query=query, k=5)

            if isinstance(docs, list) and len(docs) > 0 and docs[0][1] > 0.5:
                doc_content = "\n".join([doc[0].page_content for doc in docs])
                generated_response = generate_response(query, doc_content)
            else:
                generated_response = generate_response(query, "")

        if generated_response:
            return jsonify({"response": generated_response}), 200
        else:
            return jsonify({"error": "Failed to generate a response."}), 500

        
@app.route('/db_chat', methods=['POST'])
def db_chat():
    data = request.json
    query = data.get('query')
    app_type = session.get('app_type', None)
    db_type = session.get('db_type', None)
    print(f"App Type: {app_type}, db type: {db_type}, Query: {query}")
    
    if not query:
        return jsonify({"error": "Query not provided"}), 400
    
    response_text = ""
    
    if not query:
        return jsonify({"error": "Query not provided"}), 400

    intent = get_intent_from_llm(query)
    response_text = ""
    
    # Clear db_type if app_type is selected and vice versa
    # This ensures only one is active at a time
    if db_type and app_type:
        print(f"Both db_type and app_type present. Ensuring only one is used.")
        if request.form.get('app_type'):
            db_type = None  # Clear db_type when app_type is explicitly selected
        elif request.form.get('db_type'):
            app_type = None  # Clear app_type when db_type is explicitly selected

    if intent == 'add_responsibility':
        if app_type:  # Ensure this only works if app_type is selected
            if 'with username' in query.lower() and 'and responsibility key' in query.lower():
                username_1 = query.split('username ')[1].split(' and')[0]
                responsibility_key_1 = query.split('responsibility key ')[1]
                add_responsibility_query = get_query_from_file('add_responsibility')
                add_responsibility_query = add_responsibility_query.replace(':username_1', f'\'{username_1}\'').replace(':responsibility_key_1', f'\'{responsibility_key_1}\'')
                
                execute_query(add_responsibility_query, app_type=app_type)  # Execute on app_type
                return jsonify({"response": "Responsibility added successfully."}), 200
            else:
                return jsonify({"response": "Please provide the username and responsibility key to add responsibility."}), 200
        else:
            return jsonify({"error": "Add responsibility can only be executed in the application context."}), 403  # Return error if db_type is selected

    response_text = ""
    # Check if the query is related to tablespace usage
    if intent == 'tablespace_usage':
        tablespace_query = get_query_from_file('tablespace_usage')
        tablespace_data = execute_query(tablespace_query, db_type=db_type, app_type=app_type)
        tablespace_html = format_tablespace_html(tablespace_data)
        response_text = tablespace_html if tablespace_html else "No tablespace data found."
    elif intent == 'concurrent_manager_status':
        concurrent_manager_query = get_query_from_file('concurrent_manager_status')
        concurrent_manager_data = execute_query(concurrent_manager_query, app_type=app_type)
        concurrent_manager_html = format_concurrent_manager_status_html(concurrent_manager_data)
        response_text = concurrent_manager_html if concurrent_manager_html else "No concurrent manager processess information found."    
    elif intent == 'long_running_concurrent_programs':
        long_running_query=get_query_from_file('long_running_concurrent_programs')
        long_running_data=execute_query(long_running_query, app_type, db_type=None)
        long_running_html=format_long_running_programs_html(long_running_data)
        response_text= long_running_html if long_running_html else "no long running data found."  
    elif intent == 'workflow_mailer_status':
        workflow_mailer_query=get_query_from_file('workflow_mailer_status')
        workflow_mailer_data=execute_query(workflow_mailer_query,app_type=app_type) 
        workflow_mailer_html=format_workflow_mailer_status_html(workflow_mailer_data)
        response_text=workflow_mailer_html if workflow_mailer_html else "no workflow mailer data found."  
    elif 'show user' in query.lower():
        showuser_query = get_query_from_file('show_user')

        # Execute query on db_type only
        if db_type:
            showuser_data = execute_query(showuser_query, db_type=db_type)
            response_text = format_userinfo_html(showuser_data) if showuser_data else "No user information found in database."

        # Execute query on app_type only
        elif app_type:
            showuser_data = execute_query(showuser_query, app_type=app_type)
            response_text = format_userinfo_html(showuser_data) if showuser_data else "No user information found in application."   
    
    elif intent == 'blocking_sessions':
        blocking_query=get_query_from_file('blocking_sessions')
        blocking_data=execute_query(blocking_query, db_type=db_type)
        blocking_html=format_blocking_html(blocking_data)
        response_text=blocking_html if blocking_html else "No blocking sessions found"
    elif intent == 'instance_information':
        instance_query = get_query_from_file('instance_information')
        instance_data = execute_query(instance_query, db_type=db_type, app_type=app_type)
        instance_html = format_instance_html(instance_data)
        response_text = instance_html if instance_html else "No instance information found."
    elif intent == 'database_information':
        database_query = get_query_from_file('database_information')
        database_data = execute_query(database_query, db_type)
        database_html = format_database_html(database_data)
        response_text = database_html if database_html else "No database information found."
    else:
        response_text = "Invalid query. Please specify one of the following: tablespace usage,concurrent manager active/inactive status blocking sessions, instance information, database information, workflow mailer status, long running program status or add responsibility with username and responsibility key."

    summary = co.generate(
    model='command-xlarge-nightly',
    prompt=f"Summarize this:\n\n{response_text}",
    max_tokens=500
    )

    if summary.generations:
        print(summary.generations[0].text)
    else:
        print("No summary generated")

    return jsonify({"response": response_text, "summary": summary.generations[0].text.strip()})


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)      
    
    
if __name__ == '__main__':
    app.run(debug=False)
