from ruuvitag_sensor.ruuvitag import RuuviTag
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--tag")
args = parser.parse_args()
# print args.tag

sensor = RuuviTag(args.tag)
state = sensor.update()

# get latest state (does not get it from the device)
state = sensor.state

print(state)
