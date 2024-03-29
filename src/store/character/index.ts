import { ERROR_VALUE as FORMULA_ERROR_VALUE, Parser as FormulaParser } from 'hot-formula-parser';
import { compact, intersection, isEmpty, isEqual, last, pick, range, uniq } from 'lodash-es';
import { IObservableArray, action, autorun, computed, makeObservable, observable } from 'mobx';
import shortid from 'shortid';

import { Bloodline } from '../../types/bloodline';
import { CharacterUpgrade } from '../../types/characterUpgrade';
import { CombatStyle } from '../../types/combatStyle';
import {
  Abilities,
  AbilityType,
  Alignment,
  Archetype,
  Bonus,
  Class,
  ClassFeat,
  ClassLevel,
  Feat,
  NamedBonus,
  Race,
  RacialTrait,
  Skill,
  SkillSystem,
  SpecialFeat,
} from '../../types/core';
import { ManualEffect } from '../../types/effectType';
import { SpellManageAction } from '../../types/misc';
import {
  BASE_ABILITY,
  abilityTranslates,
  addBonusScores,
  getModifiers,
  makeAbilities,
} from '../../utils/ability';
import { markUnstackableBonus } from '../../utils/bonus';
import {
  validateGainBloodlineEffectInput,
  validateGainCombatStyleEffectInput,
  validateGainSkillEffectInput,
  validateSelectFromSubsEffectInput,
} from '../../utils/effect';
import { coreToConsolidated } from '../../utils/skill';
import { collections } from '../collection';
import { CharacterAttack } from './attack';
import { CharacterEffect } from './effect';
import { CharacterEquip } from './equip';
import { CharacterProficiency } from './proficiency';
import { CharacterSpellbook } from './spellbook';
import { CharacterStatus } from './status';
import { CharacterTracker } from './tracker';

interface OptionalCharacterParams {
  id?: string;
  skillSystem?: SkillSystem;
  alignment?: Alignment;
  bonusAbilityType?: AbilityType[];
  favoredClassIds?: string[];

  level?: number;

  raceId?: string;
  alternateRaceTraitIds?: string[];

  preparedSpellIds?: Map<string, string[]>;
  preparedSpecialSpellIds?: Map<string, string[]>;
  spellManageHistory?: SpellManageAction[];

  upgrades?: CharacterUpgrade[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  equipment?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tracker?: any;

  manualEffects?: ManualEffect[];
  deity?: string;
}

export class Character {
  id: string;
  name: string;
  skillSystem: SkillSystem;
  alignment: Alignment;
  bonusAbilityType: AbilityType[];

  pendingUpgrade: CharacterUpgrade | null;
  upgrades: IObservableArray<CharacterUpgrade>;

  raceId: string;
  alternateRaceTraitIds: string[];
  favoredClassIds: string[];
  preparedSpellIds: Map<string, string[]>;
  preparedSpecialSpellIds: Map<string, string[]>; // for domain or arcane school
  spellManageHistory: IObservableArray<SpellManageAction>;
  spellbooks: IObservableArray<CharacterSpellbook>;
  deity: string;

  manualEffects: IObservableArray<ManualEffect>;

  status: CharacterStatus;
  equipment: CharacterEquip;
  effect: CharacterEffect;
  proficiency: CharacterProficiency;
  attack: CharacterAttack;
  tracker: CharacterTracker;

  formulaParser: FormulaParser;
  formulaParserReady: boolean;

  disposes: Array<() => void>;

  constructor(
    name: string,
    {
      id,
      skillSystem = 'core',
      alignment = Alignment.N,
      bonusAbilityType,
      raceId = 'Human',
      alternateRaceTraitIds,
      preparedSpellIds,
      preparedSpecialSpellIds,
      spellManageHistory,
      favoredClassIds,
      upgrades,
      equipment,
      tracker,
      manualEffects,
      deity,
    }: OptionalCharacterParams = {}
  ) {
    makeObservable(this, {
      name: observable,
      skillSystem: observable,
      alignment: observable,
      favoredClassIds: observable,
      deity: observable,

      baseAbility: computed,
      ability: computed,
      abilityModifier: computed,
      maxBonusAbilityType: computed,
      bonusAbilityType: observable,
      racialBonusAbility: computed,

      raceId: observable,
      alternateRaceTraitIds: observable,
      race: computed,
      setRace: action,

      pendingUpgrade: observable,
      startUpgrade: action,
      cancelUpgrade: action,
      finishUpgrade: action,

      level: computed,
      levelDetail: computed,
      levelDetailForShow: computed,
      levelDetailWithoutPending: computed,
      classLevelDetail: computed,
      gainedClassFeats: computed,
      gainedClassFeatsFromFeatSource: computed,
      allGainedClassFeats: computed,
      classes: computed,

      archetypes: computed,
      archetypesWithoutPending: computed,

      classSkills: computed,
      skillRanks: computed,
      skillRanksWithoutPending: computed,

      preparedSpellIds: observable,
      preparedSpecialSpellIds: observable,
      spellManageHistory: observable,

      gainedFeats: computed,

      bloodline: computed,

      grit: computed,

      enableManualEffect: action,
      disableManualEffect: action,

      formulaParserReady: observable,
    });

    this.disposes = [];

    this.id = id ?? shortid.generate();
    this.name = name;
    this.skillSystem = skillSystem;
    this.alignment = alignment;
    this.deity = deity ?? '';

    this.bonusAbilityType = bonusAbilityType ?? [AbilityType.str];

    this.pendingUpgrade = null;
    this.upgrades = observable.array(upgrades || [], { deep: false });

    this.favoredClassIds = favoredClassIds || [];

    this.raceId = raceId;
    this.alternateRaceTraitIds = alternateRaceTraitIds || [];

    this.preparedSpellIds = preparedSpellIds || new Map();
    this.preparedSpecialSpellIds = preparedSpecialSpellIds || new Map();
    this.spellManageHistory = observable.array(spellManageHistory || [], { deep: false });

    this.formulaParserReady = false;

    this.manualEffects = observable.array(manualEffects || []);

    this.effect = new CharacterEffect(this);
    this.equipment = equipment ? CharacterEquip.parse(equipment, this) : new CharacterEquip(this);
    this.proficiency = new CharacterProficiency(this);
    this.tracker = tracker ? CharacterTracker.parse(tracker, this) : new CharacterTracker(this);
    this.status = new CharacterStatus(this);
    this.attack = new CharacterAttack(this);

    this.spellbooks = observable.array([], { deep: false });
    this.ensureSpellbooks();

    this.formulaParser = new FormulaParser();
    this.initFormulaParser();
  }

  dispose(): void {
    this.disposes.forEach((d) => d());
  }

  setSkillSystem(s: SkillSystem): void {
    this.skillSystem = s;
  }

  get race(): Race {
    return collections.race.getById(this.raceId);
  }
  setRace(raceId: string, alternateRaceTraitIds?: string[]): void {
    this.raceId = raceId;
    this.bonusAbilityType = [AbilityType.str];

    if (alternateRaceTraitIds) {
      this.alternateRaceTraitIds = alternateRaceTraitIds;
    }
  }
  get racialTraits(): Array<RacialTrait> {
    const traits = [...this.race.racialTrait];
    const replaced: string[] = [];

    this.alternateRaceTraitIds.forEach((id) => {
      const alt = this.race.alternateRacialTrait.find((t) => t.id === id);

      if (alt) {
        traits.push(alt);
        alt.replace?.forEach((r) => replaced.push(r));
      }
    });

    return traits.filter((t) => !replaced.includes(t.id));
  }

  get baseAbility(): Abilities {
    return this.upgradesWithPending.reduce(
      (acc, u) => addBonusScores(acc, u.abilities),
      makeAbilities(BASE_ABILITY)
    );
  }
  get ability(): Abilities {
    let abilities = addBonusScores(this.baseAbility, this.racialBonusAbility);

    this.effect.getAbilityBonusEffects().forEach(({ effect }) => {
      const { args } = effect;
      const ability = { [args.abilityType]: args.bonus.amount };

      abilities = addBonusScores(abilities, ability);
    });

    return abilities;
  }
  get abilityModifier(): Abilities {
    const mods = getModifiers(this.ability);

    if (this.equipment.maxDexBonus < mods.dex) {
      return {
        ...mods,
        dex: this.equipment.maxDexBonus,
      };
    }

    return mods;
  }
  get maxBonusAbilityType(): number {
    const effects = this.effect.getRacialAbilityBonusEffects();
    let amount = 0;

    if (isEmpty(this.race.ability)) {
      amount += 1;
    }

    return amount + effects.length;
  }
  get racialBonusAbility(): Partial<Abilities> {
    if (isEmpty(this.race.ability)) {
      const abilities: Partial<Abilities> = {};

      this.bonusAbilityType.forEach((t) => {
        abilities[t] = 2;
      });

      return abilities;
    }

    return this.race.ability;
  }
  getBonusesForAbilityType(a: AbilityType, includeBase = true): NamedBonus[] {
    const base = this.upgrades[0].abilities[a];
    const fromLevel = this.upgrades.slice(1).map((u) => u.abilities[a]);
    const racialBonus = this.racialBonusAbility[a];
    const fromEffects = this.effect.getAbilityBonusEffects().filter(({ effect }) => {
      return effect.args.abilityType === a;
    });

    return this.makeNamedBonuses(
      (
        [
          includeBase && base
            ? { name: '基础', bonus: { amount: base + 10, type: 'untyped' } }
            : null,
          racialBonus ? { name: '种族', bonus: { amount: racialBonus, type: 'untyped' } } : null,
          ...fromLevel
            .map((a, i) => {
              if (a) {
                return { name: `${i + 2}级`, bonus: { amount: a, type: 'untyped' } } as NamedBonus;
              }

              return null;
            })
            .filter((a): a is NamedBonus => Boolean(a)),
          ...fromEffects.map(({ effect, source }) => ({
            name: source.name,
            bonus: effect.args.bonus,
          })),
        ] as Array<NamedBonus | null>
      ).filter((a): a is NamedBonus => Boolean(a))
    );
  }

  startUpgrade(): void {
    const lastUpgrade = last(this.upgrades);
    const lastUpgradeClass = lastUpgrade ? lastUpgrade.classId : 'Fighter';
    const levelFeat =
      this.level === 1 && this.upgrades.length === 0 ? true : (this.level + 1) % 2 === 1;
    const levelAbility = (this.level + 1) % 4 === 0;

    this.pendingUpgrade = {
      classId: lastUpgradeClass,
      archetypeIds: null,
      favoredClassBonus: 'hp',
      hp: 0,
      skills: new Map(),
      abilities: {},
      feats: [],
      effectInputs: new Map(),
      spells: [],
      levelFeat,
      levelAbility,
    };
  }
  cancelUpgrade(): void {
    this.pendingUpgrade = null;
  }
  finishUpgrade(): void {
    if (this.pendingUpgrade) {
      this.upgrades.push(this.pendingUpgrade);
      this.pendingUpgrade = null;
    }
  }

  get upgradesWithPending(): Array<CharacterUpgrade> {
    return compact([...this.upgrades, this.pendingUpgrade]);
  }
  get level(): number {
    return Math.max(this.upgradesWithPending.length, 1);
  }
  get levelDetail(): Map<Class, number> {
    const levels = new Map<Class, number>();

    this.upgradesWithPending.forEach(({ classId }) => {
      const clas = collections.class.getById(classId);
      const l = levels.get(clas) || 0;

      levels.set(clas, l + 1);
    });

    return levels;
  }
  get levelDetailForShow(): Array<string> {
    return Array.from(this.levelDetail.entries()).map(([clas, level]) => `${level}级${clas.name}`);
  }
  get levelDetailWithoutPending(): Map<Class, number> {
    const levels = new Map<Class, number>();

    this.upgrades.forEach(({ classId }) => {
      const clas = collections.class.getById(classId);
      const l = levels.get(clas) || 0;

      levels.set(clas, l + 1);
    });

    return levels;
  }

  get maxFavoredClass(): number {
    let max = 1;
    const effects = this.effect.getGainFavoredClassAmountEffects();

    effects.forEach(({ effect }) => {
      max += effect.args.amount;
    });

    return max;
  }
  get classLevelDetail(): Map<Class, ClassLevel> {
    const classLevels = new Map<Class, ClassLevel>();

    this.levelDetail.forEach((l, clas) => {
      const classLevel = collections.class.getClassLevel(clas, l);

      classLevels.set(clas, classLevel);
    });

    return classLevels;
  }

  get archetypes(): Archetype[] {
    const ids = uniq(this.upgradesWithPending.map((u) => u.archetypeIds || []).flat());

    return collections.archetype.getByIds(ids);
  }
  get archetypesWithoutPending(): Archetype[] {
    const ids = uniq(this.upgrades.map((u) => u.archetypeIds || []).flat());

    return collections.archetype.getByIds(ids);
  }

  getArchetypesForClass(clas: Class): Archetype[] {
    return this.archetypes.filter((a) => a.class === clas.id);
  }

  getLevelForClass(clas: Class): number {
    const l = this.levelDetail.get(clas);

    if (l) {
      return l;
    }

    throw new Error('No class level for character');
  }

  get gainedClassFeats(): Map<Class, ClassFeat[]> {
    const result = new Map<Class, ClassFeat[]>();

    this.levelDetail.forEach((level, clas) => {
      result.set(
        clas,
        range(level)
          .map((l) =>
            collections.class.getClassFeatsByLevel(clas, l + 1, this.getArchetypesForClass(clas))
          )
          .flat()
      );
    });

    return result;
  }

  get gainedClassFeatsFromFeatSource(): Map<Class, ClassFeat[]> {
    const result = new Map<Class, ClassFeat[]>();

    this.effect.getClassFeatSourceEffects().forEach(({ source, extendedFrom }) => {
      if (source._type === 'classFeat') {
        let clas = this.classes[0];
        const rootSource = extendedFrom ? this.effect.getRootEffectSource(extendedFrom) : source;

        if (rootSource._type === 'classFeat') {
          for (const [c, f] of this.gainedClassFeats.entries()) {
            if (f.includes(rootSource)) {
              clas = c;
            }
          }
        }

        const existed = result.get(clas) ?? [];
        result.set(clas, [...existed, source]);
      }
    });

    return result;
  }

  get allGainedClassFeats(): Map<Class, ClassFeat[]> {
    const result = new Map<Class, ClassFeat[]>();

    for (const [clas, feats] of this.gainedClassFeats.entries()) {
      const featsFromFeatSource = this.gainedClassFeatsFromFeatSource.get(clas) || [];

      result.set(
        clas,
        [...feats, ...featsFromFeatSource].filter((f) => !f.placeholder)
      );
    }

    return result;
  }

  get classes(): Array<Class> {
    return uniq(this.upgradesWithPending.map((u) => u.classId)).map((cId) =>
      collections.class.getById(cId)
    );
  }

  get classSkills(): Array<string> {
    const effects = this.effect.getGainClassSkillEffects();
    const fromEffects = effects.map(({ effect }) => effect.args.skillId);

    return uniq([...this.classes.map((c) => c.classSkills).flat(), ...fromEffects]);
  }
  isClassSkill(s: Skill): boolean {
    if (s.parent) {
      return this.classSkills.includes(s.parent) || this.classSkills.includes(s.id);
    }

    if (s.core) {
      return intersection(this.classSkills, s.core).length > 0;
    }

    return this.classSkills.includes(s.id);
  }
  get skillBonusesFromEffects(): Map<string, NamedBonus[]> {
    const rankBonuses = new Map<string, NamedBonus[]>();

    this.effect.getGainSkillEffects().forEach(({ effect, source, input }) => {
      const skillId = effect.args.skillId || (input ? validateGainSkillEffectInput(input) : '');

      if (!skillId) {
        throw new Error('effect `gainSkill` need a skillId');
      }

      const skill = collections.coreSkill.getById(skillId);
      const realSkill = this.skillSystem === 'consolidated' ? coreToConsolidated(skill) : skill;

      const bonuses = rankBonuses.get(realSkill.id) ?? [];

      rankBonuses.set(realSkill.id, [
        ...bonuses,
        {
          name: source.name,
          bonus: effect.args.bonus,
        },
      ]);
    });

    return rankBonuses;
  }
  get skillRanks(): Map<string, number> {
    const ranks = new Map<string, number>();

    this.upgradesWithPending.forEach(({ skills }) => {
      Array.from(skills.entries()).forEach(([k, v]) => {
        ranks.set(k, (ranks.get(k) || 0) + v);
      });
    });

    return ranks;
  }
  get skillRanksWithoutPending(): Map<string, number> {
    const ranks = new Map<string, number>();

    this.upgrades.forEach(({ skills }) => {
      Array.from(skills.entries()).forEach(([k, v]) => {
        ranks.set(k, (ranks.get(k) || 0) + v);
      });
    });

    return ranks;
  }
  getSkillDetail(s: Skill): {
    rank: number;
    modifier: number;
    classBonus: number;
    fromEffect: number;
    isClassSkill: boolean;
    total: number;
  } {
    const rank = this.skillRanks.get(s.id) ?? 0;
    const modifier = this.abilityModifier[s.ability];
    const isClassSkill = this.isClassSkill(s);
    const classBonus = rank > 0 && isClassSkill ? 3 : 0;
    const fromEffect = this.skillBonusesFromEffects.get(s.id);
    const fromEffectAmount = fromEffect
      ? this.aggregateNamedBonusesMaxAmount(this.makeNamedBonuses(fromEffect))
      : 0;
    const bonuses = this.skillBonuses.get(s.id);

    if (!bonuses) {
      throw new Error(`no skill bonuses found for ${s.id}`);
    }

    return {
      rank,
      modifier,
      classBonus,
      isClassSkill,
      fromEffect: fromEffectAmount,
      total: this.aggregateNamedBonusesMaxAmount(bonuses),
    };
  }
  get skillBonuses(): Map<string, NamedBonus[]> {
    const bonuses = new Map<string, NamedBonus[]>();
    const skills =
      this.skillSystem === 'consolidated'
        ? collections.consolidatedSkill.data
        : collections.coreSkill.data;

    if (this.formulaParserReady) {
      skills.forEach((s) => {
        const bonusesFromEffects = this.skillBonusesFromEffects.get(s.id);
        const isClassSkill = this.isClassSkill(s);
        const rank = this.skillRanks.get(s.id) || 0;

        this.formulaParser.setVariable('currentSkillRank', rank);

        bonuses.set(
          s.id,
          this.makeNamedBonuses(
            [
              { name: '等级', bonus: { type: 'untyped', amount: rank } },
              {
                name: abilityTranslates[s.ability],
                bonus: { type: 'untyped', amount: this.abilityModifier[s.ability] },
              },
              isClassSkill && rank > 0
                ? {
                    name: '职业技能',
                    bonus: { type: 'untyped', amount: 3 },
                  }
                : null,
              s.armorPenalty
                ? {
                    name: '盔甲减值',
                    bonus: { type: 'untyped', amount: this.equipment.armorPenalty },
                  }
                : null,
              ...(bonusesFromEffects || []),
            ].filter((b): b is NamedBonus => Boolean(b))
          )
        );
      });
    }

    return bonuses;
  }

  get gainedFeats(): Feat[] {
    return this.upgradesWithPending
      .map((up) => up.feats.filter((f) => f).map((f) => collections.feat.getById(f)))
      .flat();
  }

  ensureSpellbooks(): void {
    const books: Array<CharacterSpellbook> = [];

    const effects = this.effect.getGainSpellCastingEffects();

    effects.forEach(({ effect, source }) => {
      const clas = this.classes.find((c) => {
        if (source._type === 'classFeat') {
          return c.feats.indexOf(source) !== -1;
        }

        return false;
      });

      if (clas) {
        const existedSpellbook = this.spellbooks.find((sb) => sb.class === clas);

        if (existedSpellbook) {
          books.push(existedSpellbook);
        } else {
          const newSpellbook = new CharacterSpellbook(this, clas, effect.args);
          books.push(newSpellbook);
        }
      }
    });

    this.spellbooks.replace(books);
  }

  get bloodline(): Bloodline | null {
    const es = this.effect.getGainBloodlineEffects()?.[0];

    if (es && es.input) {
      const input = validateGainBloodlineEffectInput(es.input);

      return collections.sorcererBloodline.getById(input.bloodline);
    }

    return null;
  }

  get combatStyle(): CombatStyle | null {
    const es = this.effect.getGainCombatStyleEffects()?.[0];

    if (es && es.input) {
      const input = validateGainCombatStyleEffectInput(es.input);

      return collections.rangerCombatStyles.getById(input);
    }

    return null;
  }

  get grit(): number {
    const es = this.effect.getGainGritEffects()?.[0];

    if (es) {
      const tracker = this.tracker.trackers.find((t) => t.id === es.effect.args.trackerId);

      if (tracker) {
        return tracker.current;
      }
    }

    return 0;
  }

  hasFeatSubs(feat: SpecialFeat, subIds: string[]): boolean {
    let realFeat = feat;
    if (realFeat._type === 'classFeat') {
      realFeat = (realFeat as ClassFeat).origin ?? realFeat;
    }

    const es = this.effect.getSelectFromSubsEffects();
    const hit = es.filter(({ source }) => {
      if (source._type === 'classFeat') {
        return source.origin ? source.origin.id === realFeat.id : source.id === realFeat.id;
      }

      return source.id === realFeat.id;
    });

    return Boolean(
      hit.find(({ input }) => {
        const realInput = validateSelectFromSubsEffectInput(input);

        return isEqual(realInput, subIds);
      })
    );
  }

  initFormulaParser(): void {
    const p = this.formulaParser;

    this.disposes.push(
      autorun(() => {
        this.formulaParserReady = false;

        p.setVariable('level', this.level);
        p.setVariable('clericLevel', 0);
        p.setVariable('druidLevel', 0);
        p.setVariable('inquisitorLevel', 0);

        this.levelDetail.forEach((level, clas) => {
          p.setVariable(`${clas.id.toLowerCase().replace(/[()]/g, '')}Level`, level);
        });

        p.setVariable('carryLoad', this.status.carryLoad);
        p.setVariable('armor', this.equipment.armor?.id || 'none');
        p.setVariable('armorCategory', this.equipment.armor?.type.meta.category || 'none');
        p.setVariable('buckler', this.equipment.buckler?.id || 'none');
        p.setVariable('mainHand', this.equipment.mainHand?.type.id || 'none');
        p.setVariable(
          'mainHandCategory',
          this.equipment.mainHand?.type.meta.category || 'unarmed strike'
        );
        p.setVariable('mainHandDamageType', this.equipment.mainHand?.type.meta.damageType || 'B');
        p.setVariable('offHand', this.equipment.offHand?.type.id || 'none');
        p.setVariable(
          'offHandCategory',
          this.equipment.offHand?.type.meta.category || 'unarmed strike'
        );

        p.setVariable('maxBab', this.status.maxBab);
        p.setVariable('grit', this.grit);

        [
          AbilityType.str,
          AbilityType.dex,
          AbilityType.con,
          AbilityType.int,
          AbilityType.wis,
          AbilityType.cha,
        ].forEach((s) => {
          p.setVariable(s, this.abilityModifier[s]);
        });

        p.setFunction('HAS_CLASSFEAT', (params) => {
          const [classId, classFeatId] = params;
          const subIds = params.slice(2);

          if (typeof classId !== 'string' || typeof classFeatId !== 'string') {
            throw Error(FORMULA_ERROR_VALUE);
          }

          if (subIds.length && subIds.some((id) => typeof id !== 'string')) {
            throw Error(FORMULA_ERROR_VALUE);
          }

          const clas = this.classes.find((c) => c.id === classId);

          if (!clas) return false;

          const classFeats = this.allGainedClassFeats.get(clas) || [];

          if (subIds.length) {
            const feat = classFeats.find(
              (f) => f.origin?.id === classFeatId || f.id === classFeatId
            );

            if (!feat) return false;

            return this.hasFeatSubs(feat.origin ?? feat, subIds as string[]);
          } else {
            return Boolean(
              classFeats.find((f) => f.origin?.id === classFeatId || f.id === classFeatId)
            );
          }
        });

        this.formulaParserReady = true;
      })
    );
  }
  parseFormula(form: string): number | boolean {
    const { error, result } = this.formulaParser.parse(form);

    if (error || typeof result === 'undefined' || result === null) {
      throw new Error(`formula parse error: ${error}, formula: ${form}`);
    }

    return result;
  }
  parseFormulaBoolean(form: string): boolean {
    const r = this.parseFormula(form);

    if (typeof r === 'boolean') {
      return r;
    }

    throw new Error(`expect formula ${form} to result in a boolean, got ${r}`);
  }
  parseFormulaNumber(form: string): number {
    const r = this.parseFormula(form);

    if (typeof r === 'number') {
      return r;
    }

    throw new Error(`expect formula ${form} to result in a number, got ${r}`);
  }

  makeNamedBonuses(bonuses: NamedBonus[]): NamedBonus[] {
    return markUnstackableBonus(
      bonuses
        .map((b) => {
          if (b.bonus.amountFormula) {
            const amount = Array.isArray(b.bonus.amountFormula)
              ? b.bonus.amountFormula.map((f) => this.parseFormulaNumber(f))
              : this.parseFormulaNumber(b.bonus.amountFormula);

            return {
              ...b,
              bonus: { ...b.bonus, amount },
            };
          }

          return b;
        })
        .filter(({ bonus }) => bonus.amount !== 0)
    );
  }
  aggregateBonusesMaxAmount(bonuses: Bonus[]): number {
    return bonuses.reduce((acc, b) => {
      if (b.ignored) return acc;

      const amount = Array.isArray(b.amount) ? Math.max(...b.amount) : b.amount;

      return acc + amount;
    }, 0);
  }
  aggregateBonusesAmount(bonuses: Bonus[]): number[] {
    const accLength = Math.max(
      ...bonuses.map((b) => (Array.isArray(b.amount) ? b.amount.length : 1))
    );
    const acc = Array(accLength).fill(0);

    return bonuses.reduce<number[]>((acc, b) => {
      if (b.ignored) return acc;

      return acc.map((a, i) => {
        if (Array.isArray(b.amount)) {
          return a + (b.amount[i] || 0);
        } else {
          return a + b.amount;
        }
      });
    }, acc);
  }
  aggregateNamedBonusesMaxAmount(bonuses: NamedBonus[]): number {
    return this.aggregateBonusesMaxAmount(bonuses.map((n) => n.bonus));
  }
  aggregateNamedBonusesAmount(bonuses: NamedBonus[]): number[] {
    return this.aggregateBonusesAmount(bonuses.map((n) => n.bonus));
  }

  setManualEffects(ms: ManualEffect[]): void {
    this.manualEffects.replace(
      ms.map((me) => ({
        ...me,
        enabled: me.enabled ?? true,
      }))
    );
  }
  enableManualEffect(me: ManualEffect): void {
    me.enabled = true;
  }

  disableManualEffect(me: ManualEffect): void {
    me.enabled = false;
  }

  static serializableProps = [
    'deity',
    'skillSystem',
    'alignment',
    'raceId',
    'alternateRaceTraitIds',
    'baseAbility',
    'bonusAbilityType',
    'favoredClassIds',
    'manualEffects',
    'spellManageHistory',
  ];

  static stringify(c: Character, format?: number): string {
    return JSON.stringify(
      {
        id: c.id,
        name: c.name,
        upgrades: c.upgrades.map((u) => ({
          ...u,
          skills: Array.from(u.skills.entries()),
          effectInputs: Array.from(u.effectInputs.entries()),
        })),
        equipment: CharacterEquip.stringify(c.equipment),
        tracker: CharacterTracker.stringify(c.tracker),
        preparedSpellIds: Array.from(c.preparedSpellIds.entries()),
        preparedSpecialSpellIds: Array.from(c.preparedSpecialSpellIds.entries()),
        ...pick(c, Character.serializableProps),
      },
      undefined,
      format
    );
  }

  static parse(s: string, newId?: string): Character {
    const json = JSON.parse(s);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json.upgrades = json.upgrades.map((u: any) => {
      return { ...u, skills: new Map(u.skills), effectInputs: new Map(u.effectInputs) };
    });

    json.preparedSpellIds = new Map(json.preparedSpellIds);
    json.preparedSpecialSpellIds = new Map(json.preparedSpecialSpellIds);

    if (newId) {
      json.id = newId;
    }

    return new Character(json.name, json);
  }
}
