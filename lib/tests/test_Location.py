from lib.pointFinder import Location

import unittest
from  mongomock import MongoClient



class TestLocation(unittest.TestCase):

    def setUp(self):
        self.mockCollection = MongoClient().db.collection
        self.documents = [
                # The house
                {"location": {"lat": 51.600924, "lng": -0.323493},
                 "tubuleMember": True},
                # Less than a mile away
                {"location": {"lat": 51.604427, "lng": -0.341273},
                 "tubuleMember": True}, 
                # 14 miles
                {"location": {"lat": 51.540805, "lng": -0.094807}},
                # less than 60 miles away
                {"location": {"lat": 51.678257, "lng":  0.295109}},
                # More than 100 miles away!
                {"location": {"lat": 53.601497, "lng": -0.999597},
                 "tubuleMember": True}
            ]

        for doc in self.documents:
            self.mockCollection.insert(doc)

        # Delete Object Ids of documents
        for m in self.documents:
            del m["_id"]

    # Helper method
    def helper_from_distance(self, distance, extra_query=[]):
        centerPoint = self.documents[0]["location"]
        location = Location(self.mockCollection, centerPoint["lat"], centerPoint["lng"])

        return location.members_from_point(distance, extra_query)


    def test_members_from_a_point_very_small_distance(self):
        # given
        distance = 0.002
        # when
        members = self.helper_from_distance(distance)

        # Then
        self.assertEqual(members, [self.documents[0]])
    
    def test_members_from_a_point_1_km(self):
        # given
        distance = 2
        # when
        members = self.helper_from_distance(distance)

        # Then
        self.assertEqual(members, self.documents[0:2])

    def test_members_from_a_point_20_km(self):
        # given
        distance = 20
        # when
        members = self.helper_from_distance(distance)

        # Then
        self.assertEqual(members, self.documents[0:3])

    def test_members_from_a_point_100_km(self):
        # given
        distance = 100
        # when
        members = self.helper_from_distance(distance)

        # Then
        self.assertEqual(members, self.documents[0:4])

    def test_members_from_a_point_500_km(self):
        # given
        distance = 500
        # when
        members = self.helper_from_distance(distance)

        # Then
        self.assertEqual(members, self.documents)

    def test_members_from_a_point_20_km_tubules_members(self):
        # given
        distance = 20
        extra_query = [{"tubuleMember": {"$exists": True}}]
        # when
        members = self.helper_from_distance(distance, extra_query)
        # Then
        self.assertEqual(members, self.documents[0:2])

    def test_members_from_a_point_500_km_tubules_members(self):
        # given
        distance = 500
        extra_query = [{"tubuleMember": {"$exists": True}}]

        # when
        members = self.helper_from_distance(distance, extra_query)
        expected_members = self.documents[0:2] + [self.documents[4]]

        # Then
        self.assertEqual(members, expected_members)

if __name__ == '__main__':
    unittest.main()
