
def rgetattr(object_, names, default):
    return reduce(lambda o, n: getattr(o, n, default), names, object_)
