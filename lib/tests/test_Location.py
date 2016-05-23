import unittest
from  mongomock import MongoClient

from lib.pointFinder import Location

class TestLocation(unittest.TestCase):

    def setUp(self):
        self.mockCollection = MongoClient().db.collection
        self.documents = [
                # The house
                {"location": {"lat": 51.600924, "lng": -0.323493}},
                # Less than a mile away
                {"location": {"lat": 51.604427, "lng": -0.341273}}, 
                # 14 miles
                {"location": {"lat": 51.540805, "lng": -0.094807}},
                # less than 60 miles away
                {"location": {"lat": 51.678257, "lng":  0.295109}},
                # More than 100 miles away!
                {"location": {"lat": 53.601497, "lng": -0.999597}}
            ]

        for doc in self.documents:
            self.mockCollection.insert(doc)

    # Helper method
    def helper_from_distance(self, distance):
        centerPoint = self.documents[0]["location"]
        location = Location(self.mockCollection, centerPoint["lat"], centerPoint["lng"])

        # when
        return location.members_from_point(distance)


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

if __name__ == '__main__':
    unittest.main()
