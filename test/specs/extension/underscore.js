/**
 * @file underscore扩展specs
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var u = require('underscore');

    require('extension/underscore').activate();

    describe('`purify` method', function () {
        it('should remove *empty* values', function () {
            var obj = {
                emptyString: '',
                undefinedValue: undefined,
                nullValue: null
            };

            expect(u.purify(obj)).toEqual({});
        });

        it('should remove *default* values', function () {
            var obj = {
                order: 'ASC'
            };
            var dft = {
                order: 'ASC'
            };

            expect(u.purify(obj, dft)).toEqual({});
        });

        it('should remove *empty* values recursively', function () {
            var obj = {
                title: '',
                child: {
                    title: ''
                }
            };

            expect(u.purify(obj, null, true)).toEqual({
                child: {}
            });
        });
    });

    describe('`filterObject` method', function () {
        it('should filter key-value pairs using a predicate function', function () {
            var obj = {
                Apple: 5,
                Google: 6,
                Baidu: 5,
                Facebook: 8,
                Microsoft: 9
            };

            obj = u.filterObject(obj, function (val, key) {
                return /^B/.test(key);
            });

            expect(obj).toEqual({
                Baidu: 5
            });
        });

        it('should change `this` object by specifying `context`', function () {
            var obj = {
                A: 101,
                B: 99,
                C: 96
            };
            var me = {
                count: 100
            };

            obj = u.filterObject(obj, function (val, key) {
                return val > this.count;
            }, me);

            expect(obj).toEqual({
                A: 101
            });
        });

        it('should return an empty object if `obj` is null or undefined', function () {
            expect(u.filterObject(null, u.identity)).toEqual({});
        });
    });

    describe('`mapObject` method', function () {
        it('should map each value according to a iterator function', function () {
            var obj = {
                width: 100,
                height: 60
            };

            function scaleUp(length) {
                return length * 2;
            }

            obj = u.mapObject(obj, scaleUp);

            expect(obj).toEqual({
                width: 200,
                height: 120
            });
        });

        it('should change `this` object by specifying `context`', function () {
            var obj = {
                size: {
                    width: 100,
                    height: 60
                },
                scaleStep: 2
            };

            function scaleUp(length) {
                return length * this.scaleStep;
            }

            var size = u.mapObject(obj.size, scaleUp, obj);

            expect(size).toEqual({
                width: 200,
                height: 120
            });
        });

        it('should return an empty object if `obj` is null or undefined', function () {
            expect(u.mapObject(null, u.identity)).toEqual({});
        });
    });

    describe('`mapKey` method', function () {
        it('should modify key name according to a iterator function', function () {
            var obj = {
                x: 0,
                y: 1,
                z: 0
            };

            obj = u.mapKey(obj, {
                x: 'X',
                y: 'Y'
            });

            expect(obj).toEqual({
                X: 0,
                Y: 1,
                z: 0
            });
        });

        it('should return an empty object if `obj` is null or undefined', function () {
            expect(u.mapKey(null, {})).toEqual({});
        });
    });

    describe('`trim` method', function () {
        it('should remove all leading and tailing space characters from a string', function () {
            expect(u.trim(' \tBaidu　')).toBe('Baidu');
        });
    });

    describe('`pascalize` method', function () {
        it('should convert a ` ` / `-` / `_` separated string into a Pascal-style string', function () {
            expect(u.pascalize('Williamsburg Diner')).toBe('WilliamsburgDiner');
            expect(u.pascalize('agents-of-shield')).toBe('AgentsOfShield');
            expect(u.pascalize('a-quiet_handsomeGuy')).toBe('AQuietHandsomeGuy');
        });

        it('should not keep consecutive uppercase letters if all input letters are in uppercase', function () {
            expect(u.pascalize('THE_LORD_OF_THE_RINGS')).toBe('TheLordOfTheRings');
            expect(u.pascalize('__HARRY_potter')).toBe('HARRYPotter');
        });
    });

    describe('`camelize` method', function () {
        it('should convert a ` ` / `-` / `_` separated string into a camel-case string', function () {
            expect(u.camelize('Williamsburg Diner')).toBe('williamsburgDiner');
            expect(u.camelize('agents-of-shield')).toBe('agentsOfShield');
            expect(u.camelize('a-quiet_handsomeGuy')).toBe('aQuietHandsomeGuy');
        });

        it('should not keep consecutive uppercase letters if all input letters are in uppercase', function () {
            expect(u.camelize('THE_LORD_OF_THE_RINGS')).toBe('theLordOfTheRings');
            expect(u.camelize('__HARRY_potter')).toBe('hARRYPotter');
        });
    });

    describe('`dasherize` method', function () {
        it('should convert a camel-case / pascal-style string into a `-` separated string', function () {
            expect(u.dasherize('williamsburgDiner')).toBe('williamsburg-diner');
            expect(u.dasherize('agentsOfShield')).toBe('agents-of-shield');
            expect(u.dasherize('TheLordOfTheRings')).toBe('the-lord-of-the-rings');
            expect(u.dasherize('-TopGear-')).toBe('top-gear');
        });

        it('should not keep more than two consecutive uppercase letters', function () {
            expect(u.dasherize('innerHTML')).toBe('inner-html');
            expect(u.dasherize('MathML')).toBe('math-ml');
            expect(u.dasherize('encodeURIComponent')).toBe('encode-uri-component');
        });
    });

    describe('`constanize` method', function () {
        it('should convert a camel-case / pascal-style string into a `-` separated string', function () {
            expect(u.constanize('williamsburgDiner')).toBe('WILLIAMSBURG_DINER');
            expect(u.constanize('agentsOfShield')).toBe('AGENTS_OF_SHIELD');
            expect(u.constanize('TheLordOfTheRings')).toBe('THE_LORD_OF_THE_RINGS');
        });

        it('should handle more than two consecutive uppercase letters properly', function () {
            expect(u.constanize('innerHTML')).toBe('INNER_HTML');
            expect(u.constanize('MathML')).toBe('MATH_ML');
            expect(u.constanize('encodeURIComponent')).toBe('ENCODE_URI_COMPONENT');
        });
    });

    describe('`pluralize` method', function () {
        it('should convert a noun into its plural form in a simplified way', function () {
            expect(u.pluralize('book')).toBe('books');
            expect(u.pluralize('lily')).toBe('lilies');
        });
    });

    describe('`formatNumber` method', function () {
        it('should work fine with only input number provided', function () {
            expect(u.formatNumber(-1)).toBe('-1');
            expect(u.formatNumber(0)).toBe('0');
            expect(u.formatNumber(1)).toBe('1');
            expect(u.formatNumber(10000)).toBe('10,000');
            expect(u.formatNumber(1.5)).toBe('2');
        });

        it('should work fine with empty value', function () {
            expect(u.formatNumber(null)).toBe('');
            expect(u.formatNumber(null, '--')).toBe('--');
        });

        it('should work fine with decimals specified', function () {
            expect(u.formatNumber(-1, 2)).toBe('-1.00');
            expect(u.formatNumber(0, 4)).toBe('0.0000');
            expect(u.formatNumber(1, 0)).toBe('1');
            expect(u.formatNumber(10000, 2)).toBe('10,000.00');
            expect(u.formatNumber(1.5, 3)).toBe('1.500');
            expect(u.formatNumber(null, 3)).toBe('');
        });

        it('should work fine with prefix', function () {
            expect(u.formatNumber(-1, 2, '--', '$')).toBe('$-1.00');
            expect(u.formatNumber(0, '', '$')).toBe('$0');
            expect(u.formatNumber(10000, '', '$')).toBe('$10,000');
            expect(u.formatNumber(1.5, 2, '', '$')).toBe('$1.50');
            expect(u.formatNumber(null, '--', '$')).toBe('$--');
        });
    });

    describe('`pad` method', function () {
        it('should add specified characters to the left to a string until it reaches the given length', function () {
            expect(u.pad('123', '0', 5)).toBe('00123');
            expect(u.pad('name', ' ', 8)).toBe('    name');
        });

        it('should return the input string if length is no more than zero', function () {
            expect(u.pad('123', '0', -1)).toBe('123');
        });
    });

    describe('`padRight` method', function () {
        it('should add specified characters to the right to a string until it reaches the given length', function () {
            expect(u.padRight('123', '0', 5)).toBe('12300');
            expect(u.padRight('name', ' ', 8)).toBe('name    ');
        });

        it('should return the input string if length is no more than zero', function () {
            expect(u.padRight('123', '0', -1)).toBe('123');
        });
    });

    describe('`deepClone` method', function () {
        it('should recursively clone an object', function () {
            var obj = {
                x: 1,
                y: {
                    a: 2,
                    b: 3
                },
                z: [ 4, 5 ]
            };

            expect(u.deepClone(obj)).toEqual(obj);
        });
    });

    describe('`typeOf` method', function () {
        it('should figure out the specifical type of a variable', function () {
            expect(u.typeOf('')).toBe('String');
            expect(u.typeOf(new String(''))).toBe('String');
            expect(u.typeOf(1)).toBe('Number');
            expect(u.typeOf(new Number(1))).toBe('Number');
            expect(u.typeOf(true)).toBe('Boolean');
            expect(u.typeOf(new Boolean(1))).toBe('Boolean');
            expect(u.typeOf(function () {})).toBe('Function');
            expect(u.typeOf(new Function(''))).toBe('Function');
            expect(u.typeOf([])).toBe('Array');
            expect(u.typeOf({})).toBe('Object');
        });
    });

});
