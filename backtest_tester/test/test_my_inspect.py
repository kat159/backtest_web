import types
import typing
import unittest

import numpy as np
import pandas as pd
from utils import my_inspect
from utils.my_pd import *
from utils.my_typing import *
from utils import my_pd, my_typing
from utils.my_inspect import *


class MyTestCase(unittest.TestCase):
    def test_get_file_functions(self):
        # filename = 'utils.my_pd'
        # my_inspect.get_file_functions_map(filename)
        func_info_map = get_file_functions_map(my_pd)
        for name, func_info in func_info_map.items():
            print('-------------------------')
            print('name: ', name)
            print('func: ', func_info.func)
            print('params: ', [{
                'name': param.name,
                'types': get_type_name(param.type),
            } for param in func_info.params])
            print('return_type: ', get_type_name(func_info.return_type))
            print('comments: ', func_info.comments)




if __name__ == '__main__':
    unittest.main()
