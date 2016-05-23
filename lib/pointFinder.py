from PyGeoTools.geolocation import GeoLocation

class Location:

    def __init__(self, collection, lat, lng):
        self.collection = collection  # MongoDB collection which contains members to test distance against
        self.point = GeoLocation.from_degrees(lat, lng)


    def members_from_point(self, distance):
        """
        Finds all members in DB that fit between NE and SW points of distance away from self.point
        @param distance - Distance to produce bounding points, 
        """
        SW, NE = self.point.bounding_locations(distance)
        print("Lat: {}{}\n Lon: {}{}".format(SW.deg_lat, NE.deg_lat, SW.deg_lon, NE.deg_lon))
        cur = self.collection.find({"$and": [
                    {"location.lat": {"$gt": SW.deg_lat, "$lt": NE.deg_lat}},
                    {"location.lng": {"$gt": SW.deg_lon, "$lt": NE.deg_lon}}
                ]}, 
                {"_id": False}
                )

        return [c for c in cur]


if __name__ == "__main__":
    from pymongo import MongoClient

    col = MongoClient()["tubules"]["members"]
    l = Location(col, 51.600934, -0.323375)
    l.members_from_point(1)
