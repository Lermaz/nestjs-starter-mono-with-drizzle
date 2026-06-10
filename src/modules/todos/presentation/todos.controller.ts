import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ApiStandardErrors } from '../../../common/decorators/api-error-responses.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { NonProductionGuard } from '../../../common/guards/non-production.guard';
import { unwrapDomainResult } from '../../../common/result';
import type { AuthTokenPayload } from '../../auth/public';
import { TodosService } from '../application/todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { ListTodosQueryDto } from './dto/list-todos-query.dto';
import { TodoPageResponseDto } from './dto/todo-page-response.dto';
import { TodoResponseDto } from './dto/todo-response.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { toTodoPageResponseDto } from './mappers/todo-page-response.mapper';
import { toTodoResponseDto } from './mappers/todo-response.mapper';

const WRITE_RATE_LIMIT = 30;
const WRITE_RATE_TTL_MS = 60_000;

/**
 * HTTP controller for todo operations.
 */
@ApiTags('todos')
@ApiBearerAuth()
@ApiStandardErrors()
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  /**
   * Smoke test endpoint for todos module verification.
   */
  @Public()
  @UseGuards(NonProductionGuard)
  @Get('admin/test')
  @ApiOperation({ summary: 'Todos module smoke test' })
  @ApiResponse({ status: 200, description: 'OK status' })
  getTest(): { status: string } {
    return this.todosService.getTestResponse();
  }

  /**
   * Creates a new todo.
   */
  @Throttle({ default: { ttl: WRITE_RATE_TTL_MS, limit: WRITE_RATE_LIMIT } })
  @Post()
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiResponse({ status: 201, type: TodoResponseDto })
  async createTodo(
    @CurrentUser() user: AuthTokenPayload,
    @Body() input: CreateTodoDto,
  ): Promise<TodoResponseDto> {
    const result = await this.todosService.createTodo(
      user.userId,
      input.title,
      input.isCompleted ?? false,
    );
    return toTodoResponseDto(unwrapDomainResult(result));
  }

  /**
   * Returns a paginated list of todos.
   */
  @Get()
  @ApiOperation({ summary: 'List todos with cursor pagination' })
  @ApiResponse({ status: 200, type: TodoPageResponseDto })
  async findTodosPage(
    @CurrentUser() user: AuthTokenPayload,
    @Query() query: ListTodosQueryDto,
  ): Promise<TodoPageResponseDto> {
    const page = await this.todosService.findTodosPage(
      user.userId,
      query.limit,
      query.cursor,
    );
    return toTodoPageResponseDto(page);
  }

  /**
   * Returns a single todo by id.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a todo by id' })
  @ApiResponse({ status: 200, type: TodoResponseDto })
  async findTodoById(
    @CurrentUser() user: AuthTokenPayload,
    @Param('id') id: string,
  ): Promise<TodoResponseDto> {
    const result = await this.todosService.findTodoById(user.userId, id);
    return toTodoResponseDto(unwrapDomainResult(result));
  }

  /**
   * Updates a todo by id.
   */
  @Throttle({ default: { ttl: WRITE_RATE_TTL_MS, limit: WRITE_RATE_LIMIT } })
  @Patch(':id')
  @ApiOperation({ summary: 'Update a todo by id' })
  @ApiResponse({ status: 200, type: TodoResponseDto })
  async updateTodo(
    @CurrentUser() user: AuthTokenPayload,
    @Param('id') id: string,
    @Body() input: UpdateTodoDto,
  ): Promise<TodoResponseDto> {
    const result = await this.todosService.updateTodo(
      user.userId,
      id,
      input.title,
      input.isCompleted,
    );
    return toTodoResponseDto(unwrapDomainResult(result));
  }

  /**
   * Deletes a todo by id.
   */
  @Throttle({ default: { ttl: WRITE_RATE_TTL_MS, limit: WRITE_RATE_LIMIT } })
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a todo by id' })
  @ApiResponse({ status: 204, description: 'Todo deleted' })
  async deleteTodo(
    @CurrentUser() user: AuthTokenPayload,
    @Param('id') id: string,
  ): Promise<void> {
    unwrapDomainResult(await this.todosService.deleteTodo(user.userId, id));
  }
}
