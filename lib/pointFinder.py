from PyGeoTools.geolocation import GeoLocation


class Location:

    def __init__(self, collection, lat, lng):
        # MongoDB collection which contains members to test distance against
        self.collection = collection
        self.point = GeoLocation.from_degrees(lat, lng)

    def members_from_point(self, distance, other_params=[]):
        """
        Finds all members in DB that fit between NE and SW points of distance away from self.point
        @param distance - Distance to produce bounding points, 
        @param other_params - Optional extra queries to be included. e.g. gdc_number
        """
        SW, NE = self.point.bounding_locations(distance)
        print("Lat: {}{}\n Lon: {}{}".format(
            SW.deg_lat, NE.deg_lat, SW.deg_lon, NE.deg_lon))

        p = other_params + [
            {"location.lat": {"$gt": SW.deg_lat, "$lt": NE.deg_lat}},
            {"location.lng": {"$gt": SW.deg_lon, "$lt": NE.deg_lon}}
        ]

        query = {"$and": p}

        cur = self.collection.find(query, {"_id": False})

        return [c for c in cur]


if __name__ == "__main__":
    from pymongo import MongoClient
    from pprint import pprint

    col = MongoClient()["tubules"]["members"]
    # l = Location(col, 51.600934, -0.323375)
    # print(l.members_from_point(1))

    l = Location(col, 53.911079, -1.152691)
    pprint(l.members_from_point(10))
