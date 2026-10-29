import importlib.util
from pathlib import Path
import unittest

spec=importlib.util.spec_from_file_location('worker',Path(__file__).with_name('worker.py'))
worker=importlib.util.module_from_spec(spec)
spec.loader.exec_module(worker)

class WorkerTests(unittest.TestCase):
    def test_empty_call_is_not_general_chat(self):
        self.assertEqual(worker.normalize({'type':'call','success':True,'function_calls':[]}),{'kind':'unsupported'})
    def test_low_confidence_and_negation_are_refused(self):
        data={'type':'call','success':True,'confidence':0.2,'function_calls':[{'name':'open_view','arguments':{'view':'courses'}}]}
        self.assertEqual(worker.normalize(data),{'kind':'unsupported'})
        data.update(confidence=0.9,validation={'negation':True})
        self.assertEqual(worker.normalize(data),{'kind':'unsupported'})
    def test_ungrounded_arguments_are_refused(self):
        data={'type':'call','success':True,'confidence':0.9,'validation':{'ungrounded':['prepare_focus.minutes']},'function_calls':[{'name':'prepare_focus','arguments':{'topic':'algebra','minutes':20}}]}
        self.assertEqual(worker.normalize(data),{'kind':'unsupported'})
    def test_reasoning_does_not_leave_worker(self):
        data={'type':'call','success':True,'confidence':0.6,'reasoning':'private','function_calls':[{'name':'open_view','arguments':{'view':'courses'}}]}
        result=worker.normalize(data)
        self.assertEqual(result['kind'],'proposal')
        self.assertNotIn('reasoning',result)

if __name__=='__main__': unittest.main()
