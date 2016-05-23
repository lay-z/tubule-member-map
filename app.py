from flask import Flask, url_for, request, jsonify
from flask.ext.pymongo import PyMongo
from pymongo import MongoClient
from lib.pointFinder import Location

app = Flask(__name__)
mongo = PyMongo(app)
col = MongoClient()["tubules"]["members"]

@app.route('/members')
def members():
    # Check string args
    expected_args = {"lat": None, "lng": None, "distance": None} 
    print(request.args)
    try:
        for key in expected_args.keys():
            expected_args[key] = float(request.args[key])
    except KeyError as e:
        r =  {"success": False, "message": "expected {} as argument".format(e.args[0])}
        return jsonify(**r)
    except ValueError as e:
        r =  {"success": False, "message": "please use a number for key {}".format(e.args)}
        return jsonify(**r)
    
    l = Location(col, expected_args["lat"], expected_args["lng"])
    members = l.members_from_point(expected_args["distance"])
    print("Found {} members in database".format(len(members)))

    r = {
            "success": True,
            "data": members
        }
    return jsonify(**r)

@app.route('/')
def home():
    return "Hello World"

if __name__ == '__main__':
    app.run(host='0.0.0.0')
