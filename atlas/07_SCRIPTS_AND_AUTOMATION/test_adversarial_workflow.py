import unittest
from unittest.mock import patch
from adversarial_workflow import *

class TestAdversarialWorkflow(unittest.TestCase):

    @patch('builtins.input', return_value='test_work_item')
    def test_prioritization(self, input):
        self.assertEqual(prioritization(), 'test_work_item')

    @patch('builtins.input', return_value='')
    def test_requirement_validation(self, input):
        self.assertIsNone(requirement_validation())

    @patch('subprocess.run')
    @patch('builtins.input', return_value='')
    def test_implementation(self, input, run):
        self.assertEqual(implementation('test_work_item'), 'feature/test_work_item')

    @patch('subprocess.run')
    @patch('builtins.input', return_value='test commit')
    def test_self_validation(self, input, run):
        self.assertIsNone(self_validation('feature/test_work_item'))

    @patch('builtins.input', return_value='PASS')
    def test_adversarial_review(self, input):
        self.assertEqual(adversarial_review('feature/test_work_item'), 'PASS')

    @patch('builtins.input', return_value='')
    def test_integration(self, input):
        self.assertIsNone(integration())

    @patch('builtins.input', return_value='')
    def test_deployment(self, input):
        self.assertIsNone(deployment())

if __name__ == '__main__':
    unittest.main()
