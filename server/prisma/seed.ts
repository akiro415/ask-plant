import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import {
  PLANT_CATEGORY_SEEDS,
  COMMON_CODE_SEEDS,
  SPECIES_SEEDS,
  LOCATION_SEEDS,
  PLANT_SEEDS,
  USER_SEEDS,
} from './seed-data';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function seedCategories() {
  console.log('[1/7] PlantCategory 생성/갱신 중...');
  for (const seed of PLANT_CATEGORY_SEEDS) {
    await prisma.plantCategory.upsert({
      where: { code: seed.code },
      create: { code: seed.code, name: seed.name, sortOrder: seed.sortOrder },
      update: { name: seed.name, sortOrder: seed.sortOrder },
    });
    console.log(`  - PlantCategory[${seed.code}] OK`);
  }
  console.log(`[1/7] PlantCategory ${PLANT_CATEGORY_SEEDS.length}건 완료`);
}

async function seedCommonCodes() {
  console.log('[2/7] CommonCode 생성/갱신 중...');
  for (const seed of COMMON_CODE_SEEDS) {
    await prisma.commonCode.upsert({
      where: { groupCode_code: { groupCode: seed.groupCode, code: seed.code } },
      create: { groupCode: seed.groupCode, code: seed.code, name: seed.name, sortOrder: seed.sortOrder },
      update: { name: seed.name, sortOrder: seed.sortOrder },
    });
  }
  console.log(`[2/7] CommonCode ${COMMON_CODE_SEEDS.length}건 완료`);
}

/**
 * 멀티유저 SaaS RBAC 검증용 SYSTEM ADMIN / 테스트 CUSTOMER 유저를 upsert한다.
 * 비밀번호는 재실행 시에도 항상 seed-data.ts의 평문 비밀번호로 재해싱하여 동기화한다.
 */
async function seedUsers(): Promise<{ adminId: string }> {
  console.log('[3/7] User(SYSTEM ADMIN/테스트 CUSTOMER) 생성/갱신 중...');
  let adminId = '';
  for (const seed of USER_SEEDS) {
    const passwordHash = await bcrypt.hash(seed.password, SALT_ROUNDS);
    const user = await prisma.user.upsert({
      where: { id: seed.id },
      create: {
        id: seed.id,
        email: seed.email,
        passwordHash,
        name: seed.name,
        phone: seed.phone,
        role: seed.role,
      },
      update: {
        email: seed.email,
        passwordHash,
        name: seed.name,
        phone: seed.phone,
        role: seed.role,
      },
    });
    if (seed.role === 'ADMIN') {
      adminId = user.id;
    }
    console.log(`  - User[${seed.role}] ${seed.email} (password: ${seed.password}) OK`);
  }
  console.log(`[3/7] User ${USER_SEEDS.length}건 완료`);
  return { adminId };
}

async function seedSpecies() {
  console.log('[4/7] Species(테스트 품종) 생성/갱신 중...');
  for (const seed of SPECIES_SEEDS) {
    const category = await prisma.plantCategory.findUnique({ where: { code: seed.categoryCode } });
    if (!category) {
      throw new Error(`PlantCategory(${seed.categoryCode})가 없습니다. seedCategories()가 먼저 실행되어야 합니다.`);
    }

    await prisma.species.upsert({
      where: { id: seed.id },
      create: {
        id: seed.id,
        displayName: seed.displayName,
        englishName: seed.englishName,
        taxonRank: seed.taxonRank,
        categoryId: category.id,
      },
      update: {
        displayName: seed.displayName,
        englishName: seed.englishName,
        taxonRank: seed.taxonRank,
        categoryId: category.id,
      },
    });
    console.log(`  - Species[${seed.categoryCode}] "${seed.displayName}" OK`);
  }
  console.log(`[4/7] Species ${SPECIES_SEEDS.length}건 완료`);
}

async function seedLocations() {
  console.log('[5/7] PlantLocation(테스트 위치) 생성/갱신 중...');
  for (const seed of LOCATION_SEEDS) {
    const type = await prisma.commonCode.findUnique({
      where: { groupCode_code: { groupCode: 'LOCATION_TYPE', code: seed.typeCode } },
    });
    if (!type) {
      throw new Error(`CommonCode(LOCATION_TYPE.${seed.typeCode})가 없습니다. seedCommonCodes()가 먼저 실행되어야 합니다.`);
    }

    await prisma.plantLocation.upsert({
      where: { code: seed.code },
      create: { code: seed.code, name: seed.name, typeId: type.id },
      update: { name: seed.name, typeId: type.id },
    });
    console.log(`  - PlantLocation[${seed.code}] "${seed.name}" OK`);
  }
  console.log(`[5/7] PlantLocation ${LOCATION_SEEDS.length}건 완료`);
}

/**
 * QrSequence를 접두사별로 원자적으로 증가시켜 QR 코드를 발급한다.
 * (server/src/repositories/plant.repository.ts 의 실제 발급 로직과 동일한 규칙)
 */
async function issueQrCode(prefix: string): Promise<string> {
  const sequence = await prisma.qrSequence.upsert({
    where: { prefix },
    create: { prefix, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });
  return `${prefix}-${String(sequence.lastNumber).padStart(6, '0')}`;
}

async function seedPlants(ownerId: string) {
  console.log('[6/7] Plant(테스트 개체) 생성/갱신 중...');

  const status = await prisma.commonCode.findUnique({
    where: { groupCode_code: { groupCode: 'PLANT_STATUS', code: 'IN_STOCK' } },
  });
  const originType = await prisma.commonCode.findUnique({
    where: { groupCode_code: { groupCode: 'ORIGIN_TYPE', code: 'PURCHASE' } },
  });
  if (!status || !originType) {
    throw new Error(
      'PLANT_STATUS.IN_STOCK 또는 ORIGIN_TYPE.PURCHASE CommonCode가 없습니다. seedCommonCodes()가 먼저 실행되어야 합니다.',
    );
  }

  for (const seed of PLANT_SEEDS) {
    const species = await prisma.species.findUnique({
      where: { id: seed.speciesId },
      select: { id: true, category: { select: { code: true } } },
    });
    if (!species) {
      throw new Error(`Species(${seed.speciesId})가 없습니다. seedSpecies()가 먼저 실행되어야 합니다.`);
    }

    const location = await prisma.plantLocation.findUnique({ where: { code: seed.locationCode } });

    // 이미 생성된 Plant라면 기존 qrCode를 재사용해 재실행 시 QrSequence가 불필요하게 증가하지 않도록 한다.
    const existing = await prisma.plant.findUnique({ where: { id: seed.id }, select: { qrCode: true } });
    const qrCode = existing?.qrCode ?? (await issueQrCode(species.category?.code ?? 'OTH'));

    await prisma.plant.upsert({
      where: { id: seed.id },
      create: {
        id: seed.id,
        qrCode,
        nickname: seed.nickname,
        speciesId: species.id,
        locationId: location?.id,
        statusId: status.id,
        originTypeId: originType.id,
        ownerId,
        deletedAt: null,
      },
      update: {
        nickname: seed.nickname,
        speciesId: species.id,
        locationId: location?.id,
        statusId: status.id,
        originTypeId: originType.id,
        deletedAt: null,
      },
    });
    console.log(`  - Plant[${seed.id}] "${seed.nickname}" (QR: ${qrCode}) OK`);
  }
  console.log(`[6/7] Plant ${PLANT_SEEDS.length}건 완료`);
}

/**
 * ownerId가 없는(스키마 변경 전에 생성된) 기존 Plant를 모두 SYSTEM ADMIN 소유로 백필한다.
 * RBAC 도입 후 소유자 없는 개체가 CUSTOMER/ADMIN 어느 쪽에서도 조회되지 않는 것을 방지한다.
 */
async function backfillPlantOwners(ownerId: string) {
  console.log('[7/7] 기존 Plant ownerId 백필 중...');
  const result = await prisma.plant.updateMany({
    where: { ownerId: null },
    data: { ownerId },
  });
  console.log(`[7/7] ownerId 없는 Plant ${result.count}건을 SYSTEM ADMIN(${ownerId})으로 백필 완료`);
}

async function main() {
  console.log('=== ask-plant seed 시작 ===');
  await seedCategories();
  await seedCommonCodes();
  const { adminId } = await seedUsers();
  await seedSpecies();
  await seedLocations();
  await seedPlants(adminId);
  await backfillPlantOwners(adminId);
  console.log('=== ask-plant seed 완료 ===');
  console.log('');
  console.log('확인 방법:');
  console.log('  POST /api/v1/auth/login      -> admin@ask-plant.local / admin1234!');
  console.log('                                 customer@ask-plant.local / customer1234!');
  console.log('  GET  /api/v1/plants          -> Bearer 토큰 필요, Test Plant 1~3 조회');
  console.log('  POST /api/v1/plants          -> speciesId=seed-species-* 로 신규 개체 생성 가능');
  console.log('  GET  /api/v1/public/plants/:qrCode -> 인증 불필요, 공개 조회');
}

main()
  .catch((error) => {
    console.error('[seed] 실패:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
